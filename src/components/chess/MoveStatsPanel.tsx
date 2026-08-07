import React from 'react';
import { BarChart2, Cpu, Loader2 } from 'lucide-react';
import { MoveStatsSummary } from '../../types/chess';

interface MoveStatsPanelProps {
  moveStats: MoveStatsSummary;
  totalMoves: number;
  isDefaultGame?: boolean;
  isAnalyzingGame?: boolean;
  analysisProgress?: { current: number; total: number };
  onRunAnalysis?: () => void;
}

export const MoveStatsPanel: React.FC<MoveStatsPanelProps> = React.memo(({
  moveStats,
  totalMoves,
  isDefaultGame = true,
  isAnalyzingGame = false,
  analysisProgress = { current: 0, total: 0 },
  onRunAnalysis,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-neutral-700" />
          <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider">
            Statistik Kualitas Langkah
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-neutral-500">
          Total: {totalMoves} Langkah
        </span>
      </div>

      {/* Accuracy gauges */}
      <div className="grid grid-cols-2 gap-2 bg-neutral-50/80 p-3 rounded-xl border border-neutral-100">
        <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Akurasi Putih</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">{moveStats.whiteAccuracy}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, moveStats.whiteAccuracy))}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Akurasi Hitam</span>
            <span className="text-sm font-extrabold text-blue-600 font-mono">{moveStats.blackAccuracy}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, moveStats.blackAccuracy))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Move Classification Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-cyan-50/80 border border-cyan-200/60 rounded-lg text-cyan-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">💎</span> Brilian</span>
          <span className="font-bold bg-cyan-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Brilian}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-emerald-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">⭐</span> Terbaik</span>
          <span className="font-bold bg-emerald-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Terbaik}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-green-50/80 border border-green-200/60 rounded-lg text-green-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">👍</span> Bagus</span>
          <span className="font-bold bg-green-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Bagus}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-blue-50/80 border border-blue-200/60 rounded-lg text-blue-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">📖</span> Teori</span>
          <span className="font-bold bg-blue-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Teori}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-yellow-50/80 border border-yellow-200/60 rounded-lg text-yellow-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">⚠️</span> Inakurasi</span>
          <span className="font-bold bg-yellow-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Ketidakakuratan}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-orange-50/80 border border-orange-200/60 rounded-lg text-orange-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">❓</span> Kesalahan</span>
          <span className="font-bold bg-orange-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Kesalahan}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-purple-50/80 border border-purple-200/60 rounded-lg text-purple-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">✖</span> Terlewat</span>
          <span className="font-bold bg-purple-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Terlewat}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-rose-50/80 border border-rose-200/60 rounded-lg text-rose-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">💥</span> Blunder</span>
          <span className="font-bold bg-rose-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Blunder}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-indigo-50/80 border border-indigo-200/60 rounded-lg text-indigo-900 font-medium">
          <span className="flex items-center gap-1"><span className="text-xs">🔒</span> Paksaan</span>
          <span className="font-bold bg-indigo-200/80 px-1.5 py-0.5 rounded text-[11px]">{moveStats.totalStats.Paksaan}</span>
        </div>
      </div>

      {!isDefaultGame && totalMoves > 0 && (
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-neutral-100">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Analisis Mesin Stockfish
            </span>
            {isAnalyzingGame && (
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                {analysisProgress?.current}/{analysisProgress?.total} langkah
              </span>
            )}
          </div>
          
          {isAnalyzingGame ? (
            <div className="flex flex-col gap-1.5">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 border border-indigo-200/80 rounded-xl text-indigo-700 text-xs font-bold shadow-xs cursor-not-allowed"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Menganalisis Permainan Kustom...</span>
              </button>
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      analysisProgress?.total
                        ? (analysisProgress.current / analysisProgress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={onRunAnalysis}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Mulai Analisis Penuh Stockfish</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

MoveStatsPanel.displayName = 'MoveStatsPanel';
