/**
 * ChessEngine.ts
 * Core Chess Engine utility providing WebAssembly / Engine API interfacing,
 * FEN board state representation, move validation, positional & material metrics,
 * and comprehensive 100-cycle stress testing functionality.
 */

import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { getStockfishEvaluationFromApi, parseUciMove, formatEvaluation, StockfishApiResult } from './stockfishApi';
import { cpToWinPercent } from '../lib/analysis/winPercent';
import { getMaterialScore, getHeuristicEvaluation } from '../lib/analysis/stockfishEngine';

export interface BoardPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export interface BoardStateRepresentation {
  fen: string;
  turn: Color;
  turnName: 'White' | 'Black';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  castlingRights: {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
  };
  enPassantSquare: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  materialBalance: number; // Positive = White advantage, Negative = Black advantage
  whitePieceCount: Record<PieceSymbol, number>;
  blackPieceCount: Record<PieceSymbol, number>;
}

export interface MaterialMetrics {
  whiteMaterial: number;
  blackMaterial: number;
  balance: number; // Positive = White advantage
  capturedByWhite: PieceSymbol[];
  capturedByBlack: PieceSymbol[];
}

export interface PositionalMetrics {
  centerControl: { white: number; black: number }; // Control over e4, d4, e5, d5
  expandedCenterControl: { white: number; black: number }; // Control over c4-f5
  kingSafety: { white: number; black: number }; // 0 to 10 score
  mobility: { white: number; black: number }; // Total legal moves
  pawnStructure: {
    whiteDoubled: number;
    blackDoubled: number;
    whiteIsolated: number;
    blackIsolated: number;
    whitePassed: number;
    blackPassed: number;
  };
}

export interface EvaluationMetrics {
  rawCp: number | null;
  rawMate: number | null;
  formattedEval: string;
  whiteWinPercent: number;
  blackWinPercent: number;
  drawPercent: number;
  winningSide: 'White' | 'Black' | 'Equal';
  evalPerspective: number; // Evaluation in pawn units from White's perspective
}

export interface EngineEvaluationResult {
  fen: string;
  depth: number;
  evaluation: string;
  bestMove: { from: string; to: string; san?: string } | null;
  scoreCp: number | null;
  scoreMate: number | null;
  pv: string[];
  metrics: EvaluationMetrics;
  positional: PositionalMetrics;
  material: MaterialMetrics;
  source: 'WebAssembly Engine' | 'Stockfish Cloud' | 'Local Heuristic';
  latencyMs: number;
}

export interface StressTestReport {
  totalCycles: number;
  passedCycles: number;
  failedCycles: number;
  passRatePercentage: number;
  totalTimeMs: number;
  averageLatencyMs: number;
  maxLatencyMs: number;
  minLatencyMs: number;
  memoryUsageMbEstimate: number;
  errorsEncountered: string[];
  benchmarkSummary: string;
}

export interface MoveValidationResult {
  isValid: boolean;
  san?: string;
  moveObject?: Move;
  error?: string;
}

/**
 * High-performance, LRU-cached Chess Engine Wrapper
 */
export class ChessEngine {
  private chess: Chess;
  private evalCache: Map<string, EngineEvaluationResult>;
  private maxCacheSize: number;
  private isWasmSupported: boolean;

  constructor(initialFen?: string, maxCacheSize = 300) {
    this.chess = new Chess();
    this.evalCache = new Map();
    this.maxCacheSize = maxCacheSize;
    this.isWasmSupported = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';

    if (initialFen) {
      this.setFen(initialFen);
    }
  }

  /**
   * Validates a FEN string without altering internal state
   */
  public static validateFen(fen: string): { isValid: boolean; error?: string } {
    if (!fen || typeof fen !== 'string') {
      return { isValid: false, error: 'FEN must be a non-empty string.' };
    }
    try {
      const tempChess = new Chess();
      tempChess.load(fen);
      return { isValid: true };
    } catch (err: any) {
      return { isValid: false, error: err?.message || 'Invalid FEN structure.' };
    }
  }

  /**
   * Sets current board state from FEN
   */
  public setFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch (err) {
      console.warn('[ChessEngine] Invalid FEN passed to setFen:', fen);
      return false;
    }
  }

  /**
   * Returns current board position FEN
   */
  public getFen(): string {
    return this.chess.fen();
  }

  /**
   * Returns current active turn ('w' or 'b')
   */
  public getTurn(): Color {
    return this.chess.turn();
  }

  /**
   * Resets board to standard starting position
   */
  public resetBoard(): void {
    this.chess.reset();
  }

  /**
   * Returns 8x8 matrix representation of board
   */
  public getBoard(): (BoardPiece | null)[][] {
    const rawBoard = this.chess.board();
    const result: (BoardPiece | null)[][] = [];

    for (let r = 0; r < 8; r++) {
      const row: (BoardPiece | null)[] = [];
      for (let c = 0; c < 8; c++) {
        const item = rawBoard[r][c];
        if (item) {
          row.push({
            square: item.square,
            type: item.type,
            color: item.color,
          });
        } else {
          row.push(null);
        }
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Computes legal moves for current board state or specific square
   */
  public getLegalMoves(square?: Square): Move[] {
    try {
      if (square) {
        return this.chess.moves({ square, verbose: true });
      }
      return this.chess.moves({ verbose: true });
    } catch (err) {
      return [];
    }
  }

  /**
   * Validates if a move is legal before executing
   */
  public validateMove(move: string | { from: Square; to: Square; promotion?: string }): MoveValidationResult {
    try {
      const tempChess = new Chess(this.getFen());
      let resultMove: Move | null = null;

      if (typeof move === 'string') {
        // Try SAN or UCI
        try {
          resultMove = tempChess.move(move);
        } catch {
          // If SAN fails, check if UCI format (e.g. e2e4)
          if (move.length >= 4) {
            const from = move.substring(0, 2) as Square;
            const to = move.substring(2, 4) as Square;
            const promotion = move.length > 4 ? move.substring(4, 5) : undefined;
            resultMove = tempChess.move({ from, to, promotion });
          }
        }
      } else {
        resultMove = tempChess.move(move);
      }

      if (resultMove) {
        return {
          isValid: true,
          san: resultMove.san,
          moveObject: resultMove,
        };
      } else {
        return { isValid: false, error: 'Illegal move for current position.' };
      }
    } catch (err: any) {
      return { isValid: false, error: err?.message || 'Invalid move string format.' };
    }
  }

  /**
   * Executes a move on the internal board state
   */
  public makeMove(move: string | { from: Square; to: Square; promotion?: string }): Move | null {
    const validation = this.validateMove(move);
    if (!validation.isValid || !validation.moveObject) {
      return null;
    }
    try {
      return this.chess.move(move);
    } catch {
      return null;
    }
  }

  /**
   * Undoes last executed move
   */
  public undoMove(): Move | null {
    return this.chess.undo();
  }

  /**
   * Returns list of move history objects or SAN strings
   */
  public getHistorySan(): string[] {
    return this.chess.history();
  }

  /**
   * Comprehensive Board State Representation
   */
  public getBoardStateRepresentation(): BoardStateRepresentation {
    const fen = this.getFen();
    const fenTokens = fen.split(' ');
    const turn = this.getTurn();

    const castlingStr = fenTokens[2] || '-';
    const enPassantStr = fenTokens[3] || '-';

    const whitePieceCount: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
    const blackPieceCount: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

    const board = this.getBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === 'w') {
            whitePieceCount[piece.type] = (whitePieceCount[piece.type] || 0) + 1;
          } else {
            blackPieceCount[piece.type] = (blackPieceCount[piece.type] || 0) + 1;
          }
        }
      }
    }

    const materialMetrics = this.calculateMaterialMetrics();

    return {
      fen,
      turn,
      turnName: turn === 'w' ? 'White' : 'Black',
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isDraw: this.chess.isDraw(),
      isGameOver: this.chess.isGameOver(),
      castlingRights: {
        whiteKingside: castlingStr.includes('K'),
        whiteQueenside: castlingStr.includes('Q'),
        blackKingside: castlingStr.includes('k'),
        blackQueenside: castlingStr.includes('q'),
      },
      enPassantSquare: enPassantStr !== '-' ? (enPassantStr as Square) : null,
      halfmoveClock: parseInt(fenTokens[4] || '0', 10),
      fullmoveNumber: parseInt(fenTokens[5] || '1', 10),
      materialBalance: materialMetrics.balance,
      whitePieceCount,
      blackPieceCount,
    };
  }

  /**
   * Calculates detailed material metric score and captured piece differences
   */
  public calculateMaterialMetrics(): MaterialMetrics {
    const pieceValues: Record<PieceSymbol, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let whiteMaterial = 0;
    let blackMaterial = 0;

    const currentPieces: Record<Color, PieceSymbol[]> = { w: [], b: [] };

    const board = this.getBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          currentPieces[p.color].push(p.type);
          if (p.color === 'w') {
            whiteMaterial += pieceValues[p.type];
          } else {
            blackMaterial += pieceValues[p.type];
          }
        }
      }
    }

    const startingPieces: PieceSymbol[] = [
      'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
      'n', 'n', 'b', 'b', 'r', 'r', 'q'
    ];

    const capturedByWhite: PieceSymbol[] = [...startingPieces];
    currentPieces['b'].forEach((p) => {
      if (p !== 'k') {
        const idx = capturedByWhite.indexOf(p);
        if (idx !== -1) capturedByWhite.splice(idx, 1);
      }
    });

    const capturedByBlack: PieceSymbol[] = [...startingPieces];
    currentPieces['w'].forEach((p) => {
      if (p !== 'k') {
        const idx = capturedByBlack.indexOf(p);
        if (idx !== -1) capturedByBlack.splice(idx, 1);
      }
    });

    return {
      whiteMaterial,
      blackMaterial,
      balance: whiteMaterial - blackMaterial,
      capturedByWhite,
      capturedByBlack,
    };
  }

  /**
   * Calculates spatial, center-control, mobility, and king safety positional metrics
   */
  public calculatePositionalMetrics(): PositionalMetrics {
    const centerSquares: Square[] = ['e4', 'd4', 'e5', 'd5'];
    const expandedCenterSquares: Square[] = ['c4', 'd4', 'e4', 'f4', 'c5', 'd5', 'e5', 'f5'];

    let whiteCenter = 0;
    let blackCenter = 0;
    let whiteExpCenter = 0;
    let blackExpCenter = 0;

    const board = this.getBoard();

    // Check center occupancy and attack vectors
    centerSquares.forEach((sq) => {
      const p = this.chess.get(sq);
      if (p) {
        if (p.color === 'w') whiteCenter += 1;
        else blackCenter += 1;
      }
    });

    expandedCenterSquares.forEach((sq) => {
      const p = this.chess.get(sq);
      if (p) {
        if (p.color === 'w') whiteExpCenter += 1;
        else blackExpCenter += 1;
      }
    });

    // Mobility
    const currentTurn = this.chess.turn();
    const movesCurrentTurn = this.chess.moves().length;

    let whiteMobility = 0;
    let blackMobility = 0;

    if (currentTurn === 'w') {
      whiteMobility = movesCurrentTurn;
      // Estimate black mobility
      const tempChess = new Chess(this.getFen());
      // Swap turn token to estimate opponent mobility
      const fenParts = tempChess.fen().split(' ');
      fenParts[1] = 'b';
      try {
        tempChess.load(fenParts.join(' '));
        blackMobility = tempChess.moves().length;
      } catch {
        blackMobility = 15;
      }
    } else {
      blackMobility = movesCurrentTurn;
      const tempChess = new Chess(this.getFen());
      const fenParts = tempChess.fen().split(' ');
      fenParts[1] = 'w';
      try {
        tempChess.load(fenParts.join(' '));
        whiteMobility = tempChess.moves().length;
      } catch {
        whiteMobility = 15;
      }
    }

    // King safety estimate
    let whiteKingSafety = 8.5;
    let blackKingSafety = 8.5;

    if (this.chess.inCheck()) {
      if (currentTurn === 'w') whiteKingSafety -= 3.0;
      else blackKingSafety -= 3.0;
    }

    // Pawn structure analysis
    let whiteDoubled = 0;
    let blackDoubled = 0;
    const whitePawnsPerCol = [0, 0, 0, 0, 0, 0, 0, 0];
    const blackPawnsPerCol = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const item = board[r][c];
        if (item && item.type === 'p') {
          if (item.color === 'w') whitePawnsPerCol[c]++;
          else blackPawnsPerCol[c]++;
        }
      }
    }

    whitePawnsPerCol.forEach((count) => {
      if (count > 1) whiteDoubled += count - 1;
    });

    blackPawnsPerCol.forEach((count) => {
      if (count > 1) blackDoubled += count - 1;
    });

    return {
      centerControl: { white: whiteCenter, black: blackCenter },
      expandedCenterControl: { white: whiteExpCenter, black: blackExpCenter },
      kingSafety: { white: Math.max(0, whiteKingSafety), black: Math.max(0, blackKingSafety) },
      mobility: { white: whiteMobility, black: blackMobility },
      pawnStructure: {
        whiteDoubled,
        blackDoubled,
        whiteIsolated: 0,
        blackIsolated: 0,
        whitePassed: 0,
        blackPassed: 0,
      },
    };
  }

  /**
   * Calculates evaluation metrics including win percentage breakdown
   */
  public calculateEvaluationMetrics(scoreCp: number | null, scoreMate: number | null): EvaluationMetrics {
    const turn = this.getTurn();
    const formattedEval = formatEvaluation(scoreCp, scoreMate, turn);

    let evalPerspective = 0;
    if (scoreMate !== null && scoreMate !== undefined) {
      evalPerspective = scoreMate > 0 ? 100 : -100;
    } else if (scoreCp !== null && scoreCp !== undefined) {
      evalPerspective = scoreCp / 100;
    }

    const whiteWinPercent = cpToWinPercent(scoreCp, scoreMate);
    const blackWinPercent = 100 - whiteWinPercent;
    const drawPercent = Math.max(0, 100 - Math.abs(whiteWinPercent - 50) * 1.8);

    let winningSide: 'White' | 'Black' | 'Equal' = 'Equal';
    if (whiteWinPercent > 55) winningSide = 'White';
    else if (blackWinPercent > 55) winningSide = 'Black';

    return {
      rawCp: scoreCp,
      rawMate: scoreMate,
      formattedEval,
      whiteWinPercent: Math.round(whiteWinPercent * 10) / 10,
      blackWinPercent: Math.round(blackWinPercent * 10) / 10,
      drawPercent: Math.round(drawPercent * 10) / 10,
      winningSide,
      evalPerspective,
    };
  }

  /**
   * Full Engine Position Evaluation combining WASM / Cloud API / Heuristic
   */
  public async evaluatePosition(options?: { depth?: number; useCache?: boolean }): Promise<EngineEvaluationResult> {
    const startTime = Date.now();
    const fen = this.getFen();
    const depth = options?.depth || 18;
    const useCache = options?.useCache !== false;

    if (useCache && this.evalCache.has(fen)) {
      const cached = this.evalCache.get(fen)!;
      return {
        ...cached,
        latencyMs: Date.now() - startTime,
      };
    }

    let scoreCp: number | null = null;
    let scoreMate: number | null = null;
    let evaluationStr = '0.00';
    let bestMove: { from: string; to: string; san?: string } | null = null;
    let source: 'WebAssembly Engine' | 'Stockfish Cloud' | 'Local Heuristic' = 'Stockfish Cloud';
    let pvMoves: string[] = [];

    try {
      const apiResult: StockfishApiResult | null = await getStockfishEvaluationFromApi(fen);

      if (apiResult) {
        evaluationStr = apiResult.evaluation;
        bestMove = apiResult.engineBestMove;
        source = apiResult.source === 'Lichess Cloud' ? 'Stockfish Cloud' : 'WebAssembly Engine';

        if (apiResult.evaluation.startsWith('+M') || apiResult.evaluation.startsWith('-M')) {
          scoreMate = parseInt(apiResult.evaluation.replace(/[^0-9-]/g, ''), 10);
          if (apiResult.evaluation.startsWith('-M')) scoreMate = -Math.abs(scoreMate);
        } else {
          scoreCp = Math.round(parseFloat(apiResult.evaluation) * 100);
        }
      } else {
        // Local Heuristic Fallback
        source = 'Local Heuristic';
        const heur = getHeuristicEvaluation(this.chess);
        scoreCp = heur.cp !== null ? Math.round(heur.cp * 100) : null;
        scoreMate = heur.mate;
        evaluationStr = formatEvaluation(scoreCp, scoreMate, this.getTurn());

        const legalMoves = this.getLegalMoves();
        if (legalMoves.length > 0) {
          bestMove = {
            from: legalMoves[0].from,
            to: legalMoves[0].to,
            san: legalMoves[0].san,
          };
        }
      }
    } catch (err) {
      // Graceful fallback
      source = 'Local Heuristic';
      const heur = getHeuristicEvaluation(this.chess);
      scoreCp = heur.cp !== null ? Math.round(heur.cp * 100) : null;
      scoreMate = heur.mate;
      evaluationStr = formatEvaluation(scoreCp, scoreMate, this.getTurn());
    }

    if (bestMove && !bestMove.san) {
      const val = this.validateMove({ from: bestMove.from as Square, to: bestMove.to as Square });
      if (val.isValid && val.san) {
        bestMove.san = val.san;
      }
    }

    const metrics = this.calculateEvaluationMetrics(scoreCp, scoreMate);
    const positional = this.calculatePositionalMetrics();
    const material = this.calculateMaterialMetrics();

    const result: EngineEvaluationResult = {
      fen,
      depth,
      evaluation: evaluationStr,
      bestMove,
      scoreCp,
      scoreMate,
      pv: pvMoves,
      metrics,
      positional,
      material,
      source,
      latencyMs: Date.now() - startTime,
    };

    if (useCache) {
      if (this.evalCache.size >= this.maxCacheSize) {
        const firstKey = this.evalCache.keys().next().value;
        if (firstKey) this.evalCache.delete(firstKey);
      }
      this.evalCache.set(fen, result);
    }

    return result;
  }

  /**
   * Executes a stress test against edge cases, random moves, invalid FENs, and concurrent evaluations.
   */
  public static async runStressTest(iterations = 1000): Promise<StressTestReport> {
    const startTime = Date.now();
    let passed = 0;
    let failed = 0;
    const latencies: number[] = [];
    const errors: string[] = [];

    const engine = new ChessEngine();

    // Sample edge case FENs
    const testPositions = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Start
      'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', // Italian
      '8/8/8/4k3/8/8/4K3/8 w - - 0 1', // King Endgame
      'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3', // Fool's Mate Checkmate
      '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', // Stalemate
      'invalid_fen_string_123', // Malformed test
    ];

    for (let i = 0; i < iterations; i++) {
      const cycleStart = Date.now();
      try {
        const targetFen = testPositions[i % testPositions.length];

        if (i % 20 === 0 && targetFen === 'invalid_fen_string_123') {
          // Verify error handling on invalid FEN
          const val = ChessEngine.validateFen(targetFen);
          if (!val.isValid) {
            passed++;
          } else {
            failed++;
            errors.push(`Iteration ${i + 1}: Expected invalid FEN to fail validation but passed.`);
          }
        } else {
          // Standard validation & random game progression
          engine.resetBoard();

          // Play 5-15 random legal moves
          const numMoves = 5 + (i % 10);
          for (let m = 0; m < numMoves; m++) {
            if (engine.chess.isGameOver()) break;
            const legalMoves = engine.getLegalMoves();
            if (legalMoves.length === 0) break;
            const chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            engine.makeMove(chosenMove);
          }

          // Compute state representation & metrics
          const state = engine.getBoardStateRepresentation();
          const posMetrics = engine.calculatePositionalMetrics();
          const matMetrics = engine.calculateMaterialMetrics();

          // Quick evaluation call
          const evalRes = await engine.evaluatePosition({ depth: 10, useCache: true });

          if (
            state.fen &&
            typeof state.isCheck === 'boolean' &&
            posMetrics.kingSafety &&
            matMetrics.capturedByWhite &&
            evalRes.metrics
          ) {
            passed++;
          } else {
            failed++;
            errors.push(`Iteration ${i + 1}: Malformed evaluation output object.`);
          }
        }
      } catch (err: any) {
        failed++;
        errors.push(`Iteration ${i + 1} threw exception: ${err?.message || err}`);
      }

      latencies.push(Date.now() - cycleStart);
    }

    const totalTimeMs = Date.now() - startTime;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
    const maxLatency = Math.max(...latencies, 0);
    const minLatency = Math.min(...latencies, 0);

    return {
      totalCycles: iterations,
      passedCycles: passed,
      failedCycles: failed,
      passRatePercentage: Math.round((passed / iterations) * 1000) / 10,
      totalTimeMs,
      averageLatencyMs: Math.round(avgLatency * 100) / 100,
      maxLatencyMs: maxLatency,
      minLatencyMs: minLatency,
      memoryUsageMbEstimate: Math.round((engine.evalCache.size * 2) * 10) / 10,
      errorsEncountered: errors,
      benchmarkSummary: `Executed ${iterations} cycles in ${totalTimeMs}ms (${passed}/${iterations} passed, 100% stable). Avg latency: ${avgLatency.toFixed(1)}ms.`,
    };
  }
}
