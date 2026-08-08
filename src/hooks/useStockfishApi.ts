import { useState, useEffect, useRef } from 'react';
import { EngineBestMove } from '../types/chess';
import { getStockfishEvaluationFromApi } from '../utils/stockfishApi';

interface StockfishApiOptions {
  /** Target engine search depth (typically 12 for fast online API calculation) */
  targetDepth?: number;
  /** Milliseconds to debounce requests to prevent API rate limiting */
  debounceMs?: number;
}

/**
 * Custom React hook that integrates the public Stockfish API.
 * Provides real-time position evaluations, search depth, latency, and recommended moves.
 */
export function useStockfishApi(
  activeFen: string,
  options: StockfishApiOptions = {}
) {
  const { targetDepth = 12, debounceMs = 300 } = options;

  const [evaluation, setEvaluation] = useState<string>('Mengevaluasi...');
  const [engineBestMove, setEngineBestMove] = useState<EngineBestMove | null>(null);
  const [engineDepth, setEngineDepth] = useState<number>(0);
  const [analysisTimeMs, setAnalysisTimeMs] = useState<number>(0);
  const [source, setSource] = useState<string>('Cloud API');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeFenRef = useRef<string>(activeFen);
  activeFenRef.current = activeFen;

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setEvaluation('Mengevaluasi...');
    setIsLoading(true);

    const currentTargetFen = activeFen;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await getStockfishEvaluationFromApi(currentTargetFen, targetDepth);
        if (activeFenRef.current !== currentTargetFen) return; // Discard stale response
        setEvaluation(result.evaluation);
        setEngineBestMove(result.engineBestMove);
        setEngineDepth(result.engineDepth);
        setAnalysisTimeMs(result.timeMs);
        setSource(result.source);
        setIsLoading(false);
      } catch (err: any) {
        if (activeFenRef.current !== currentTargetFen) return;
        setEvaluation('Gagal memproses');
        setError(err?.message || 'Error API Stockfish');
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeFen, targetDepth, debounceMs]);

  const clearEngineHash = () => {
    // API is stateless, hash clear is a no-op
  };

  return {
    evaluation,
    engineBestMove,
    engineDepth,
    analysisTimeMs,
    source,
    isLoading,
    error,
    clearEngineHash,
  };
}
