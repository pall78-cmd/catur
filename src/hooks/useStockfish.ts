import { useState, useEffect, useRef } from 'react';
import { EngineBestMove } from '../types/chess';

export function useStockfish(activeFen: string) {
  const [evaluation, setEvaluation] = useState<string>('Mengevaluasi...');
  const [engineBestMove, setEngineBestMove] = useState<EngineBestMove | null>(null);
  const engineRef = useRef<Worker | null>(null);
  const activeFenRef = useRef(activeFen);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    activeFenRef.current = activeFen;
  }, [activeFen]);

  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker('/stockfish.js');
      engineRef.current = worker;
      worker.postMessage('uci');

      worker.onerror = (err) => {
        console.error('Stockfish worker error:', err);
        setEvaluation('Gagal memuat mesin');
      };

      worker.onmessage = (e) => {
        let line = e.data;
        if (line && typeof line === 'object' && typeof line.data === 'string') {
          line = line.data;
        }
        if (typeof line !== 'string') return;

        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          if (parts[1] && parts[1].length >= 4 && parts[1] !== '(none)') {
            const moveStr = parts[1];
            setEngineBestMove({ from: moveStr.substring(0, 2), to: moveStr.substring(2, 4) });
          }
          return;
        }

        if (line.startsWith('info') && line.includes('score')) {
          const now = Date.now();
          // Throttle state updates to every 80ms to avoid UI thread lag
          if (now - lastUpdateRef.current < 80) return;
          lastUpdateRef.current = now;

          const pvMatch = line.match(/pv ([a-h][1-8])([a-h][1-8])/);
          if (pvMatch) {
            setEngineBestMove({ from: pvMatch[1], to: pvMatch[2] });
          }

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
              scoreStr = mateMoves > 0 ? `+M${Math.abs(mateMoves)}` : `-M${Math.abs(mateMoves)}`;
            }
            setEvaluation(scoreStr);
          }
        }
      };
    } catch (err) {
      console.error('Failed to create Stockfish worker:', err);
      setEvaluation('Mesin tidak dapat dijalankan');
    }

    return () => {
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.postMessage('stop');
      engineRef.current.postMessage(`position fen ${activeFen}`);
      engineRef.current.postMessage('go depth 12');
      setEvaluation('Mengevaluasi...');
      setEngineBestMove(null);
    }
  }, [activeFen]);

  return { evaluation, engineBestMove };
}
