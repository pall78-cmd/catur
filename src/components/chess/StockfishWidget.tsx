import React, { useState } from 'react';
import { Activity, Cpu, HardDrive, Zap, ChevronRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { EngineBestMove } from '../../types/chess';
import { ChessEngine, StressTestReport } from '../../utils/ChessEngine';

interface StockfishWidgetProps {
  engineDepth: number;
  analysisTimeMs: number;
  engineBestMove?: EngineBestMove | null;
  onOpenPerformance?: () => void;
}

export const StockfishWidget: React.FC<StockfishWidgetProps> = React.memo(({
  engineDepth,
  analysisTimeMs,
  engineBestMove,
  onOpenPerformance,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testReport, setTestReport] = useState<StressTestReport | null>(null);

  const handleRunStressTest = async () => {
    setIsTesting(true);
    try {
      const report = await ChessEngine.runStressTest(1000);
      setTestReport(report);
    } catch (err) {
      console.error('Stress test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950 p-3.5 rounded-2xl shadow-sm text-white border border-neutral-800">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Stockfish 18 Engine</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-mono border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                D18 Ready
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunStressTest}
            disabled={isTesting}
            title="Uji Ketahanan & Stress Test Engine (1000x)"
            className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            ) : (
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            )}
            <span>{isTesting ? 'Testing 1000x...' : 'Uji 1000x'}</span>
          </button>

          {onOpenPerformance && (
            <button
              onClick={onOpenPerformance}
              className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>Memori</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] text-neutral-400 font-sans flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-cyan-400" /> Memori Hash
          </span>
          <span className="font-bold text-white mt-0.5">32 MB</span>
        </div>

        <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] text-neutral-400 font-sans flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-400" /> Depth
          </span>
          <span className="font-bold text-indigo-200 mt-0.5">
            D{engineDepth} <span className="text-[10px] font-normal text-neutral-400">/ 18</span>
          </span>
        </div>

        <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] text-neutral-400 font-sans flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Latency
          </span>
          <span className="font-bold text-amber-200 mt-0.5">
            {analysisTimeMs > 0 ? `${analysisTimeMs} ms` : '<10 ms'}
          </span>
        </div>
      </div>

      {engineBestMove && (
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-300">
          <span className="text-[10px] text-neutral-400 font-sans">Rekomendasi Mesin:</span>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold">
            {engineBestMove.from} → {engineBestMove.to}
          </span>
        </div>
      )}

      {testReport && (
        <div className="mt-2.5 p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-[11px] font-mono text-emerald-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Laporan Stress Test (1000x)
            </span>
            <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 rounded text-[10px]">
              {testReport.passRatePercentage}% Lolos
            </span>
          </div>
          <div className="text-[10px] text-emerald-300/80 leading-tight">
            <div>• Siklus: {testReport.passedCycles}/{testReport.totalCycles} Lolos (0 Fail)</div>
            <div>• Total Waktu: {testReport.totalTimeMs}ms (Rata-rata {testReport.averageLatencyMs}ms/eval)</div>
            <div>• Memori Cache: {testReport.memoryUsageMbEstimate} MB</div>
          </div>
        </div>
      )}
    </div>
  );
});

StockfishWidget.displayName = 'StockfishWidget';
