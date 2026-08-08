import { useState, useEffect, useRef } from 'react';
import { EngineBestMove } from '../types/chess';
import { getStockfishEvaluationFromApi } from '../utils/stockfishApi';

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
 * Automatically falls back to the public Stockfish/Lichess Cloud API when local WebWorker
 * is restricted, disabled, or encounters an execution error.
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
  const [isApiFallback, setIsApiFallback] = useState<boolean>(false);
  const [analyzedFen, setAnalyzedFen] = useState<string>('');

  const engineRef = useRef<Worker | null>(null);
  const isWorkerReadyRef = useRef<boolean>(false);
  const activeFenRef = useRef(activeFen);
  const lastUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const livenessTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync latest FEN to ref for async worker callback evaluation context
  useEffect(() => {
    activeFenRef.current = activeFen;
  }, [activeFen]);

  // Worker Initialization & Message Event Listener
  useEffect(() => {
    let worker: Worker | null = null;
    let isReadyTimeout: NodeJS.Timeout | null = null;

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

      // If worker does not send 'readyok' within 3000ms, fallback to API
      isReadyTimeout = setTimeout(() => {
        if (!isWorkerReadyRef.current) {
          console.warn('[Stockfish] Local worker not responding to ready signals. Falling back to public API.');
          setIsApiFallback(true);
        }
      }, 3000);

      worker.onerror = (err) => {
        console.warn('Stockfish worker execution error, falling back to public API:', err);
        setIsApiFallback(true);
      };

      worker.onmessage = (e: MessageEvent) => {
        let line = e.data;
        if (line && typeof line === 'object' && typeof line.data === 'string') {
          line = line.data;
        }
        if (typeof line !== 'string') return;

        // Clear liveness timeout on receiving messages from worker
        if (livenessTimerRef.current) {
          clearTimeout(livenessTimerRef.current);
          livenessTimerRef.current = null;
        }

        // Parse readyok
        if (line === 'readyok') {
          isWorkerReadyRef.current = true;
          if (isReadyTimeout) clearTimeout(isReadyTimeout);
          return;
        }

        // Parse bestmove line output from Stockfish
        if (line.startsWith('bestmove')) {
          setAnalysisTimeMs(Date.now() - startTimeRef.current);
          setAnalyzedFen(activeFenRef.current);
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

          // Only parse PV line from multipv 1 (or default line without multipv tag or multipv 1)
          const isMultiPv2Or3 = line.includes('multipv ') && !line.includes('multipv 1');
          if (!isMultiPv2Or3) {
            const pvMatch = line.match(/pv ([a-h][1-8])([a-h][1-8])/);
            if (pvMatch) {
              setEngineBestMove({ from: pvMatch[1], to: pvMatch[2] });
            }
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
              if (Math.abs(score) < 0.001) score = 0;
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
            setAnalyzedFen(currentFen);
          }
        }
      };
    } catch (err) {
      console.warn('Failed to instantiate Stockfish worker, falling back to public API:', err);
      setIsApiFallback(true);
    }

    return () => {
      if (isReadyTimeout) clearTimeout(isReadyTimeout);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (livenessTimerRef.current) {
        clearTimeout(livenessTimerRef.current);
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
    if (livenessTimerRef.current) {
      clearTimeout(livenessTimerRef.current);
      livenessTimerRef.current = null;
    }

    setEvaluation('Mengevaluasi...');
    setEngineBestMove(null);
    setEngineDepth(0);

    // Short 30ms debounce avoids spamming stop/go during rapid navigation or auto-play
    debounceTimerRef.current = setTimeout(async () => {
      if (isApiFallback) {
        startTimeRef.current = Date.now();
        const result = await getStockfishEvaluationFromApi(activeFen, 12);
        setEvaluation(result.evaluation);
        setEngineBestMove(result.engineBestMove);
        setEngineDepth(result.engineDepth);
        setAnalysisTimeMs(result.timeMs);
        setAnalyzedFen(activeFen);
        return;
      }

      if (engineRef.current) {
        startTimeRef.current = Date.now();
        engineRef.current.postMessage('stop');
        engineRef.current.postMessage(`position fen ${activeFen}`);
        engineRef.current.postMessage(`go depth ${targetDepth}`);

        // Set safety liveness timer: if worker never responded with readyok within 4000ms, fall back to API
        livenessTimerRef.current = setTimeout(() => {
          if (!isWorkerReadyRef.current) {
            console.warn('[Stockfish] Local worker became unresponsive. Falling back to public API.');
            setIsApiFallback(true);
          }
        }, 4000);
      } else {
        // If no worker exists, trigger fallback
        setIsApiFallback(true);
      }
    }, 30);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (livenessTimerRef.current) {
        clearTimeout(livenessTimerRef.current);
      }
    };
  }, [activeFen, targetDepth, isApiFallback]);

  const clearEngineHash = () => {
    if (isApiFallback) return; // Stateless fallback
    if (engineRef.current) {
      engineRef.current.postMessage('ucinewgame');
      engineRef.current.postMessage(`setoption name Hash value ${hashSize}`);
      engineRef.current.postMessage('isready');
      engineRef.current.postMessage(`position fen ${activeFen}`);
      engineRef.current.postMessage(`go depth ${targetDepth}`);
    }
  };

  return { evaluation, engineBestMove, engineDepth, analysisTimeMs, isApiFallback, analyzedFen, clearEngineHash };
}

