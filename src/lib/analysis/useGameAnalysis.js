import { useEffect, useRef, useState, useCallback } from "react";
import { StockfishAnalyzer } from "./stockfishEngine.js";
import { analyzeGame } from "./gameAnalyzer.js";

export function useGameAnalysis({ depth = 22, multipv = 3 } = {}) {
  const analyzerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      analyzerRef.current = new StockfishAnalyzer({
        multipv,
        onError: (err) => setError(err?.message || String(err)),
      });
      setIsReady(true);
    } catch (err) {
      setError(err?.message || String(err));
    }

    return () => {
      analyzerRef.current?.destroy();
      analyzerRef.current = null;
    };
  }, []);

  const runAnalysis = useCallback(
    async (pgn) => {
      if (!analyzerRef.current) return;
      setIsAnalyzing(true);
      setError(null);
      setProgress({ current: 0, total: 0 });

      try {
        const result = await analyzeGame(pgn, analyzerRef.current, {
          depth,
          onProgress: (current, total) => setProgress({ current, total }),
        });
        setReport(result);
      } catch (err) {
        setError(err?.message || String(err));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [depth]
  );

  return { isReady, isAnalyzing, progress, report, error, runAnalysis };
}
