/**
 * stockfishEngine.js
 */

import { Chess } from "chess.js";

export function getMaterialScore(chess) {
  let score = 0;
  try {
    const board = chess.board();
    for (const row of board) {
      if (!row) continue;
      for (const square of row) {
        if (square) {
          let value = 0;
          switch (square.type) {
            case 'p': value = 1.0; break;
            case 'n': value = 3.05; break; // Slightly higher knight value for positional balance
            case 'b': value = 3.15; break; // Slightly higher bishop value (bishop pair is good)
            case 'r': value = 5.0; break;
            case 'q': value = 9.0; break;
            case 'k': value = 0.0; break;
          }
          if (square.color === 'w') {
            score += value;
          } else {
            score -= value;
          }
        }
      }
    }
  } catch (e) {
    console.error("getMaterialScore error:", e);
  }
  return score;
}

export function getHeuristicEvaluation(chess) {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return { cp: null, mate: chess.turn() === 'w' ? -1 : 1 };
    }
    return { cp: 0, mate: null }; // Draw / Stalemate
  }

  let score = getMaterialScore(chess);

  // Tiny positional score for checks
  if (chess.inCheck()) {
    score += chess.turn() === 'w' ? -0.3 : 0.3;
  }

  // Small mobility incentive
  try {
    const legalMovesCount = chess.moves().length;
    const mobilityBonus = legalMovesCount * 0.001; // reduced from 0.005 to prevent turn-based score swings
    score += chess.turn() === 'w' ? mobilityBonus : -mobilityBonus;
  } catch (e) {}

  return { cp: Math.round(score * 100), mate: null };
}

export function defaultThreadCount() {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    return Math.max(1, navigator.hardwareConcurrency - 1);
  }
  return 2;
}

/** Parse satu baris "info ... pv ..." dari Stockfish jadi objek terstruktur. */
export function parseInfoLine(line) {
  if (!line.startsWith("info") || !line.includes(" pv ")) return null;

  const tokens = line.split(" ");
  let depth = null;
  let multipv = 1;
  let scoreCp = null;
  let scoreMate = null;
  let pv = [];

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "depth") depth = parseInt(tokens[i + 1], 10);
    else if (tokens[i] === "multipv") multipv = parseInt(tokens[i + 1], 10);
    else if (tokens[i] === "score") {
      if (tokens[i + 1] === "cp") scoreCp = parseInt(tokens[i + 2], 10);
      else if (tokens[i + 1] === "mate") scoreMate = parseInt(tokens[i + 2], 10);
    } else if (tokens[i] === "pv") {
      pv = tokens.slice(i + 1);
      break;
    }
  }

  return { depth, multipv, scoreCp, scoreMate, pv };
}

export class StockfishAnalyzer {
  constructor({
    workerPath = "/stockfish.js",
    threads,
    hashMb = 128,
    multipv = 3,
    onError,
  } = {}) {
    this.multipv = multipv;
    this._threads = threads;
    this._hashMb = hashMb;
    this._currentAnalysis = null;
    this._onError = onError || ((e) => console.error("Stockfish error:", e));
    this._isReady = false;
    this._initStatus = 'uninitialized';
    this._commandQueue = [];

    try {
      const resolvedPath = new URL(workerPath, window.location.origin).href;
      this.worker = new Worker(resolvedPath);
      this.worker.onmessage = (e) => this._handleMessage(e.data);
      this.worker.onerror = (err) => {
        console.warn("[Stockfish Engine] WebWorker error. Falling back to heuristic mode.", err);
        this._isReady = false;
        this._initStatus = 'fallback';
        this._clearInitTimeout?.();
        if (this._resolveReady) {
          this._resolveReady();
        }
      };
    } catch (err) {
      console.warn("[Stockfish Engine] Failed to instantiate worker. Falling back to Heuristic mode:", err);
      this.worker = null;
    }

    this._readyPromise = new Promise((resolve, reject) => {
      this._resolveReady = resolve;
      this._rejectReady = reject;

      if (!this.worker) {
        // Resolve immediately so fallback mode is active and doesn't block loading
        this._isReady = true;
        this._initStatus = 'ready';
        resolve();
        return;
      }

      const initTimeout = setTimeout(() => {
        if (this._initStatus !== 'ready') {
          console.warn("[Stockfish Engine] Initialization timed out after 10000ms. Falling back to Heuristic mode.");
          this._isReady = false;
          this._initStatus = 'fallback';
          resolve(); // Resolve successfully so promise chain stays unbroken
        }
      }, 10000);

      this._clearInitTimeout = () => clearTimeout(initTimeout);
    });

    if (this.worker) {
      this._initStatus = 'ready_sent';
      this._sendRaw("uci");
      const resolvedThreads = this._threads || defaultThreadCount();
      this._sendRaw(`setoption name Threads value ${resolvedThreads}`);
      this._sendRaw(`setoption name Hash value ${this._hashMb}`);
      this._sendRaw(`setoption name MultiPV value ${this.multipv}`);
      this._sendRaw("setoption name UCI_LimitStrength value false");
      this._sendRaw("ucinewgame");
      this._sendRaw("isready");
    }

    this._queue = this._readyPromise;
  }

  _sendRaw(cmd) {
    if (this.worker) {
      try {
        this.worker.postMessage(cmd);
      } catch (e) {
        console.error("[Stockfish Engine] Failed to send message to worker:", e);
      }
    }
  }

  _send(cmd) {
    if (this._isReady) {
      this._sendRaw(cmd);
    } else {
      this._commandQueue.push(cmd);
    }
  }

  _handleMessage(rawLine) {
    let line = rawLine;
    if (line && typeof line === "object" && typeof line.data === "string") {
      line = line.data;
    }
    if (typeof line !== "string") return;

    if (line === "readyok") {
      this._initStatus = 'ready';
      this._isReady = true;
      this._clearInitTimeout?.();
      if (this._resolveReady) {
        this._resolveReady();
      }
      while (this._commandQueue.length > 0) {
        const cmd = this._commandQueue.shift();
        this._sendRaw(cmd);
      }
      return;
    }

    if (!this._currentAnalysis) return;

    if (line.startsWith("info")) {
      const parsed = parseInfoLine(line);
      if (parsed) {
        this._currentAnalysis.lines[parsed.multipv - 1] = parsed;
      }
    } else if (line.startsWith("bestmove")) {
      const { lines, resolve } = this._currentAnalysis;
      this._currentAnalysis = null;
      resolve(lines.filter(Boolean));
    }
  }

  newGame() {
    this._send("ucinewgame");
  }

  setMultiPv(n) {
    this.multipv = n;
    this._send(`setoption name MultiPV value ${n}`);
  }

  analyzePosition(fen, { depth = 22, timeout = 10000 } = {}) {
    const nextPromise = this._queue
      .catch(() => {}) // Ignore previous failures in the chain so future analyses can run independently
      .then(() => this._runAnalysis(fen, depth, timeout));
    
    this._queue = nextPromise;
    return nextPromise;
  }

  _runAnalysis(fen, depth, timeout) {
    return new Promise((resolve, reject) => {
      // Graceful fallback to heuristic evaluation if worker is not active OR not fully ready yet
      if (!this.worker || !this._isReady) {
        let score = { cp: 0, mate: null };
        try {
          const tempChess = new Chess(fen);
          score = getHeuristicEvaluation(tempChess);
          // Standard UCI score is relative to side to move
          if (tempChess.turn() === 'b') {
            if (score.cp !== null) score.cp = -score.cp;
            if (score.mate !== null) score.mate = -score.mate;
          }
        } catch (e) {}
        const parsed = {
          depth: 5,
          multipv: 1,
          scoreCp: score.cp,
          scoreMate: score.mate,
          pv: []
        };
        return resolve([parsed]);
      }

      let resolved = false;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this._currentAnalysis = null;
          const errMsg = `Stockfish analysis timed out: no response from engine within ${timeout}ms.`;
          console.error(`[Stockfish Engine] ${errMsg}`);
          reject(new Error(errMsg));
        }
      }, timeout);

      this._currentAnalysis = {
        lines: [],
        resolve: (lines) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(lines);
          }
        },
        reject: (err) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            reject(err);
          }
        },
        timeoutId
      };

      this._send(`position fen ${fen}`);
      this._send(`go depth ${depth}`);
    });
  }

  destroy() {
    this._clearInitTimeout?.();
    if (this._currentAnalysis?.timeoutId) {
      clearTimeout(this._currentAnalysis.timeoutId);
    }
    if (this._currentAnalysis?.reject) {
      this._currentAnalysis.reject(new Error("Stockfish analyzer destroyed."));
    }
    this._currentAnalysis = null;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this._isReady = false;
    this._initStatus = 'uninitialized';
  }
}

export function pvToSan(chessInstance, fen, uciMoves, maxMoves = 8) {
  const originalFen = chessInstance.fen();
  try {
    chessInstance.load(fen);
  } catch (e) {
    return [];
  }

  const sanMoves = [];
  for (const uci of uciMoves.slice(0, maxMoves)) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4) : undefined;
    try {
      const move = chessInstance.move({ from, to, promotion });
      if (!move) break;
      sanMoves.push(move.san);
    } catch (e) {
      break;
    }
  }

  chessInstance.load(originalFen);
  return sanMoves;
}
