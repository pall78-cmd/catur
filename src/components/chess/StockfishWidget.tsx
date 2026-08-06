import React from 'react';
import { Activity, Cpu, HardDrive, Zap, ChevronRight } from 'lucide-react';
import { EngineBestMove } from '../../types/chess';

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
    </div>
  );
});

StockfishWidget.displayName = 'StockfishWidget';
