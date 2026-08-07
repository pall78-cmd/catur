import { useState, useEffect, useRef } from 'react';
import { EngineBestMove } from '../types/chess';

/**
 * Options for configuring Stockfish engine analysis depth & performance.
 */
interface StockfishOptions {
  /** Maximum calculation depth (default 18 for Stockfish 18 engine analysis) */
  targetDepth?: number;
  /** Hash memory size in MB (default 32MB for transposition caching) */
  hashSize?: number;
  /** UI state update throttle in milliseconds */
  throttleMs?: number;
}

/**
 * React hook managing Stockfish 18 WebWorker lifecycle, UCI command dispatching,
 * debounced position analysis, and evaluation result parsing.
 *
 * @param activeFen - The current position in Forsyth–Edwards Notation (FEN)
 * @param options - Optional engine parameters for depth and performance tuning
 */
export function useStockfish(
  activeFen: string,
  options: StockfishOptions = {}
) {
  const { targetDepth = 18, hashSize = 32, throttleMs = 80 } = options;

  const [evaluation, setEvaluation] = useState<string>('Mengevaluasi...');
  const [engineBestMove, setEngineBestMove] = useState<EngineBestMove | null>(null);
  const [engineDepth, setEngineDepth] = useState<number>(0);
  const [analysisTimeMs, setAnalysisTimeMs] = useState<number>(0);

  const engineRef = useRef<Worker | null>(null);
  const activeFenRef = useRef(activeFen);
  const lastUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync latest FEN to ref for async worker callback evaluation context
  useEffect(() => {
    activeFenRef.current = activeFen;
  }, [activeFen]);

  // Worker Initialization & Message Event Listener
  useEffect(() => {
    let worker: Worker | null = null;
    try {
      const workerUrl = new URL('/stockfish.js', window.location.origin).href;
      worker = new Worker(workerUrl);
      engineRef.current = worker;

      // UCI Engine Protocol Configuration
      worker.postMessage('uci');
      
      const threads = typeof navigator !== "undefined" && navigator.hardwareConcurrency 
        ? Math.max(1, navigator.hardwareConcurrency - 1) 
        : 2;
      worker.postMessage(`setoption name Threads value ${threads}`);
      worker.postMessage('setoption name MultiPV value 3');
      worker.postMessage(`setoption name Hash value ${hashSize}`);
      worker.postMessage('isready');

      worker.onerror = (err) => {
        console.error('Stockfish worker execution error:', err);
        setEvaluation('Gagal memuat mesin');
      };

      worker.onmessage = (e: MessageEvent) => {
        let line = e.data;
        if (line && typeof line === 'object' && typeof line.data === 'string') {
          line = line.data;
        }
        if (typeof line !== 'string') return;

        // Parse bestmove line output from Stockfish
        if (line.startsWith('bestmove')) {
          setAnalysisTimeMs(Date.now() - startTimeRef.current);
          const parts = line.split(' ');
          if (parts[1] && parts[1].length >= 4 && parts[1] !== '(none)') {
            const moveStr = parts[1];
            setEngineBestMove({
              from: moveStr.substring(0, 2),
              to: moveStr.substring(2, 4),
            });
          }
          return;
        }

        // Parse any info calculation progress depth
        if (line.startsWith('info')) {
          const depthMatch = line.match(/\bdepth (\d+)\b/);
          if (depthMatch) {
            const currentD = parseInt(depthMatch[1], 10);
            setEngineDepth(currentD);
          }
        }

        // Parse info calculation progress & score
        if (line.startsWith('info') && line.includes('score')) {
          setAnalysisTimeMs(Date.now() - startTimeRef.current);

          const now = Date.now();
          // Throttle state dispatches to preserve 60 FPS UI rendering performance
          if (now - lastUpdateRef.current < throttleMs) return;
          lastUpdateRef.current = now;

          // Parse Principal Variation (PV) first suggested move
          const pvMatch = line.match(/pv ([a-h][1-8])([a-h][1-8])/);
          if (pvMatch) {
            setEngineBestMove({ from: pvMatch[1], to: pvMatch[2] });
          }

          // Parse numeric Centipawn (cp) score or Mate in X (mate)
          const match = line.match(/score (cp|mate) (-?\d+)/);
          if (match) {
            const type = match[1];
            const val = parseInt(match[2], 10);
            const currentFen = activeFenRef.current || '';
            const sideToMove = currentFen.split(' ')[1] || 'w';
            const isBlack = sideToMove === 'b';

            let scoreStr = '';
            if (type === 'cp') {
              let score = val / 100;
              if (isBlack) score = -score;
              scoreStr = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
            } else if (type === 'mate') {
              let mateMoves = val;
              if (isBlack) mateMoves = -mateMoves;
              scoreStr =
                mateMoves > 0
                  ? `+M${Math.abs(mateMoves)}`
                  : `-M${Math.abs(mateMoves)}`;
            }
            setEvaluation(scoreStr);
          }
        }
      };
    } catch (err) {
      console.error('Failed to instantiate Stockfish worker:', err);
      setEvaluation('Mesin tidak dapat dijalankan');
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
    };
  }, [hashSize, throttleMs]);

  // Debounced Position Evaluation Trigger
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setEvaluation('Mengevaluasi...');
    setEngineBestMove(null);
    setEngineDepth(0);

    // Short 30ms debounce avoids spamming stop/go during rapid navigation or auto-play
    debounceTimerRef.current = setTimeout(() => {
      if (engineRef.current) {
        startTimeRef.current = Date.now();
        engineRef.current.postMessage('stop');
        engineRef.current.postMessage(`position fen ${activeFen}`);
        engineRef.current.postMessage(`go depth ${targetDepth}`);
      }
    }, 30);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeFen, targetDepth]);

  const clearEngineHash = () => {
    if (engineRef.current) {
      engineRef.current.postMessage('ucinewgame');
      engineRef.current.postMessage(`setoption name Hash value ${hashSize}`);
      engineRef.current.postMessage('isready');
      engineRef.current.postMessage(`position fen ${activeFen}`);
      engineRef.current.postMessage(`go depth ${targetDepth}`);
    }
  };

  return { evaluation, engineBestMove, engineDepth, analysisTimeMs, clearEngineHash };
}

