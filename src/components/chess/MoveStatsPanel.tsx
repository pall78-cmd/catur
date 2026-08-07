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
  const [activeTab, setActiveTab] = React.useState<'split' | 'white' | 'black' | 'total'>('split');

  const categories = [
    { key: 'Brilian', label: 'Brilian', icon: '💎', colorBg: 'bg-cyan-50/80', colorBorder: 'border-cyan-200/60', colorText: 'text-cyan-900', colorBadge: 'bg-cyan-200/80' },
    { key: 'Terbaik', label: 'Terbaik', icon: '⭐', colorBg: 'bg-emerald-50/80', colorBorder: 'border-emerald-200/60', colorText: 'text-emerald-900', colorBadge: 'bg-emerald-200/80' },
    { key: 'Bagus', label: 'Bagus', icon: '👍', colorBg: 'bg-green-50/80', colorBorder: 'border-green-200/60', colorText: 'text-green-900', colorBadge: 'bg-green-200/80' },
    { key: 'Teori', label: 'Teori', icon: '📖', colorBg: 'bg-blue-50/80', colorBorder: 'border-blue-200/60', colorText: 'text-blue-900', colorBadge: 'bg-blue-200/80' },
    { key: 'Ketidakakuratan', label: 'Inakurasi', icon: '⚠️', colorBg: 'bg-yellow-50/80', colorBorder: 'border-yellow-200/60', colorText: 'text-yellow-900', colorBadge: 'bg-yellow-200/80' },
    { key: 'Kesalahan', label: 'Kesalahan', icon: '❓', colorBg: 'bg-orange-50/80', colorBorder: 'border-orange-200/60', colorText: 'text-orange-900', colorBadge: 'bg-orange-200/80' },
    { key: 'Blunder', label: 'Blunder', icon: '💥', colorBg: 'bg-rose-50/80', colorBorder: 'border-rose-200/60', colorText: 'text-rose-900', colorBadge: 'bg-rose-200/80' },
    { key: 'Paksaan', label: 'Paksaan', icon: '🔒', colorBg: 'bg-indigo-50/80', colorBorder: 'border-indigo-200/60', colorText: 'text-indigo-900', colorBadge: 'bg-indigo-200/80' },
    { key: 'Terlewat', label: 'Terlewat', icon: '✖', colorBg: 'bg-purple-50/80', colorBorder: 'border-purple-200/60', colorText: 'text-purple-900', colorBadge: 'bg-purple-200/80' },
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-neutral-200/90 p-3 sm:p-3.5 flex flex-col gap-2.5">
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
      <div className="grid grid-cols-2 gap-2 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
        <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-600"></span> Putih
            </span>
            <span className="text-xs font-extrabold text-emerald-600 font-mono">{moveStats.whiteAccuracy}%</span>
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
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 border border-blue-700"></span> Hitam
            </span>
            <span className="text-xs font-extrabold text-blue-600 font-mono">{moveStats.blackAccuracy}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, moveStats.blackAccuracy))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter / View selector tabs */}
      <div className="flex items-center p-1 bg-neutral-100/80 rounded-xl text-[10px] font-bold gap-1">
        <button
          onClick={() => setActiveTab('split')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'split'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Bandingkan
        </button>
        <button
          onClick={() => setActiveTab('white')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'white'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Putih
        </button>
        <button
          onClick={() => setActiveTab('black')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'black'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Hitam
        </button>
        <button
          onClick={() => setActiveTab('total')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'total'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Total
        </button>
      </div>

      {/* Detailed Side-by-Side or Single View Stats */}
      {activeTab === 'split' ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* White Column */}
          <div className="flex flex-col gap-1 bg-emerald-50/30 p-2 rounded-xl border border-emerald-100">
            <div className="text-[10px] font-bold text-emerald-800 border-b border-emerald-200/60 pb-1 mb-1 flex items-center gap-1">
              <span>♔</span> Putih ({moveStats.whiteAccuracy}%)
            </div>
            {categories.map((cat) => {
              const val = moveStats.whiteStats[cat.key] || 0;
              return (
                <div key={`w-${cat.key}`} className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] ${val > 0 ? cat.colorBg : 'bg-neutral-50/50 opacity-60'} border ${cat.colorBorder}`}>
                  <span className="flex items-center gap-1"><span className="text-[10px]">{cat.icon}</span> {cat.label}</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${cat.colorBadge}`}>{val}</span>
                </div>
              );
            })}
          </div>

          {/* Black Column */}
          <div className="flex flex-col gap-1 bg-blue-50/30 p-2 rounded-xl border border-blue-100">
            <div className="text-[10px] font-bold text-blue-800 border-b border-blue-200/60 pb-1 mb-1 flex items-center gap-1">
              <span>♚</span> Hitam ({moveStats.blackAccuracy}%)
            </div>
            {categories.map((cat) => {
              const val = moveStats.blackStats[cat.key] || 0;
              return (
                <div key={`b-${cat.key}`} className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] ${val > 0 ? cat.colorBg : 'bg-neutral-50/50 opacity-60'} border ${cat.colorBorder}`}>
                  <span className="flex items-center gap-1"><span className="text-[10px]">{cat.icon}</span> {cat.label}</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${cat.colorBadge}`}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          {categories.map((cat) => {
            const statsObj = activeTab === 'white' 
              ? moveStats.whiteStats 
              : activeTab === 'black' 
              ? moveStats.blackStats 
              : moveStats.totalStats;
            const val = statsObj[cat.key] || 0;
            return (
              <div
                key={`single-${cat.key}`}
                className={`flex items-center justify-between px-2.5 py-1.5 ${cat.colorBg} border ${cat.colorBorder} rounded-lg ${cat.colorText} font-medium`}
              >
                <span className="flex items-center gap-1"><span className="text-xs">{cat.icon}</span> {cat.label}</span>
                <span className={`font-bold ${cat.colorBadge} px-1.5 py-0.5 rounded text-[11px]`}>{val}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stockfish Engine Analysis Section */}
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
        
        {totalMoves === 0 ? (
          <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-xl text-[11px] text-neutral-500 leading-relaxed text-center">
            Mainkan langkah pertama Anda di papan catur untuk merekam permainan dan mengaktifkan analisis kualitas langkah penuh.
          </div>
        ) : isAnalyzingGame ? (
          <div className="flex flex-col gap-1.5">
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 border border-indigo-200/80 rounded-xl text-indigo-700 text-xs font-bold shadow-xs cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Menganalisis Permainan...</span>
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
    </div>
  );
});

MoveStatsPanel.displayName = 'MoveStatsPanel';
