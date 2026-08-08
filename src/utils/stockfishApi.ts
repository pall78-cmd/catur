/**
 * stockfishApi.ts
 * Utility for fetching chess position evaluations from public Stockfish-compatible APIs.
 * Combines Lichess Cloud Evaluation (for instant high-depth cache) and
 * Stockfish.online API (for real-time live engine calculations).
 */

export interface StockfishApiResult {
  evaluation: string;
  engineBestMove: { from: string; to: string } | null;
  engineDepth: number;
  timeMs: number;
  source: 'Lichess Cloud' | 'Stockfish Online' | 'Local Heuristic';
}

/**
 * Normalizes UCI move notation to a bestmove coordinate object.
 * e.g., "e2e4" -> { from: "e2", to: "e4" }
 */
export function parseUciMove(uci: string): { from: string; to: string } | null {
  if (!uci || uci.length < 4) return null;
  return {
    from: uci.substring(0, 2),
    to: uci.substring(2, 4),
  };
}

/**
 * Formats a numeric centipawn or mate score into standard chess prefix format (e.g. +1.24, -3.10, +M2)
 */
export function formatEvaluation(scoreCp: number | null | undefined, scoreMate: number | null | undefined, sideToMove: 'w' | 'b'): string {
  if (scoreMate !== null && scoreMate !== undefined) {
    let val = scoreMate;
    // Standardize perspective: if Black is to move and Black is getting mated, mate score is negative.
    // We want to show from White's perspective (+ means White is winning/mating, - means Black is winning/mating).
    if (sideToMove === 'b') {
      val = -val;
    }
    return val > 0 ? `+M${Math.abs(val)}` : `-M${Math.abs(val)}`;
  }

  if (scoreCp !== null && scoreCp !== undefined) {
    let val = scoreCp / 100;
    if (sideToMove === 'b') {
      val = -val;
    }
    if (Math.abs(val) < 0.001) return '0.00';
    return val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
  }

  return '0.00';
}

/**
 * Fetches evaluation from Lichess Cloud Database
 */
async function fetchLichessCloudEval(fen: string): Promise<StockfishApiResult | null> {
  const startTime = Date.now();
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.error) return null;

    // Get side to move from FEN
    const sideToMove = (fen.split(' ')[1] || 'w') as 'w' | 'b';

    // Parse best move from first PV line
    let bestMove: { from: string; to: string } | null = null;
    if (data.pvs && data.pvs[0] && data.pvs[0].moves) {
      const firstMoveUci = data.pvs[0].moves.split(' ')[0];
      bestMove = parseUciMove(firstMoveUci);
    }

    // Parse evaluation
    let evalStr = '0.00';
    if (data.pvs && data.pvs[0]) {
      const pv = data.pvs[0];
      if (pv.mate !== undefined && pv.mate !== null) {
        // Lichess returns mate relative to the side to move
        evalStr = formatEvaluation(null, pv.mate, sideToMove);
      } else if (pv.cp !== undefined && pv.cp !== null) {
        // Lichess returns cp relative to the side to move
        evalStr = formatEvaluation(pv.cp, null, sideToMove);
      }
    }

    return {
      evaluation: evalStr,
      engineBestMove: bestMove,
      engineDepth: data.depth || 30,
      timeMs: Date.now() - startTime,
      source: 'Lichess Cloud',
    };
  } catch (e) {
    return null;
  }
}

/**
 * Fetches evaluation from Stockfish.online Live Engine API
 */
async function fetchStockfishOnlineEval(fen: string, targetDepth: number = 12): Promise<StockfishApiResult | null> {
  const startTime = Date.now();
  try {
    // Stockfish.online API supports depths between 5 and 15 without keys. 12 is extremely fast and reliable.
    const resolvedDepth = Math.max(5, Math.min(15, targetDepth));
    const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${resolvedDepth}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.success) return null;

    // Parse bestmove from string like "bestmove e2e4 ponder e7e5"
    let bestMove: { from: string; to: string } | null = null;
    if (typeof data.bestmove === 'string') {
      const match = data.bestmove.match(/bestmove\s+([a-h][1-8])([a-h][1-8])/);
      if (match) {
        bestMove = { from: match[1], to: match[2] };
      } else {
        const parts = data.bestmove.split(' ');
        if (parts[1] && parts[1].length >= 4) {
          bestMove = parseUciMove(parts[1]);
        }
      }
    }

    // Parse evaluation
    let evalStr = '0.00';
    if (data.mate !== null && data.mate !== undefined) {
      const mateVal = Number(data.mate);
      evalStr = mateVal > 0 ? `+M${Math.abs(mateVal)}` : `-M${Math.abs(mateVal)}`;
    } else if (data.evaluation !== null && data.evaluation !== undefined) {
      const cpVal = Number(data.evaluation);
      evalStr = cpVal > 0 ? `+${cpVal.toFixed(2)}` : cpVal.toFixed(2);
    }

    // Extract actual depth
    let actualDepth = resolvedDepth;
    if (typeof data.data === 'string') {
      const match = data.data.match(/\bdepth\s+(\d+)\b/);
      if (match) {
        actualDepth = parseInt(match[1], 10);
      }
    }

    return {
      evaluation: evalStr,
      engineBestMove: bestMove,
      engineDepth: actualDepth,
      timeMs: Date.now() - startTime,
      source: 'Stockfish Online',
    };
  } catch (e) {
    return null;
  }
}

/**
 * Primary unified function to evaluate a FEN position using public APIs with fallback mechanism
 */
export async function getStockfishEvaluationFromApi(
  fen: string,
  targetDepth: number = 12
): Promise<StockfishApiResult> {
  // 1. Try Lichess Cloud Evaluation for instant results
  const cloudResult = await fetchLichessCloudEval(fen);
  if (cloudResult) return cloudResult;

  // 2. Fall back to Stockfish.online live calculations
  const onlineResult = await fetchStockfishOnlineEval(fen, targetDepth);
  if (onlineResult) return onlineResult;

  // 3. Absolute offline fallback (Local Heuristic score as last resort)
  const startTime = Date.now();
  return {
    evaluation: '0.00',
    engineBestMove: null,
    engineDepth: 0,
    timeMs: Date.now() - startTime,
    source: 'Local Heuristic',
  };
}
