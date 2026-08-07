/**
 * stockfishEngine.js
 */

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
    this._currentAnalysis = null;
    this._onError = onError || ((e) => console.error("Stockfish error:", e));

    try {
      this.worker = new Worker(workerPath);
    } catch (err) {
      this._onError(err);
      throw err;
    }

    this.worker.onmessage = (e) => this._handleMessage(e.data);
    this.worker.onerror = (err) => this._onError(err);

    const resolvedThreads = threads || defaultThreadCount();

    this._readyPromise = new Promise((resolve) => {
      this._resolveReady = resolve;
    });

    this._send("uci");
    this._send(`setoption name Threads value ${resolvedThreads}`);
    this._send(`setoption name Hash value ${hashMb}`);
    this._send(`setoption name MultiPV value ${multipv}`);
    this._send("setoption name UCI_LimitStrength value false");
    this._send("ucinewgame");
    this._send("isready");

    this._queue = this._readyPromise;
  }

  _send(cmd) {
    this.worker.postMessage(cmd);
  }

  _handleMessage(line) {
    if (typeof line !== "string") return;

    if (line === "readyok") {
      if (this._resolveReady) {
        this._resolveReady();
        this._resolveReady = null;
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

  analyzePosition(fen, { depth = 22 } = {}) {
    this._queue = this._queue.then(() => this._runAnalysis(fen, depth));
    return this._queue;
  }

  _runAnalysis(fen, depth) {
    return new Promise((resolve) => {
      this._currentAnalysis = { lines: [], resolve };
      this._send(`position fen ${fen}`);
      this._send(`go depth ${depth}`);
    });
  }

  destroy() {
    this.worker.terminate();
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
