import React from 'react';
import { Sparkles, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { DynamicAnnotationResult, EngineBestMove } from '../../types/chess';

interface ActiveMoveCardProps {
  currentMoveIndex: number;
  lastMove: any;
  currentAnnotation: DynamicAnnotationResult | null;
  evaluation: string;
  engineBestMove: EngineBestMove | null;
  interactiveTrial: any;
}

export const ActiveMoveCard: React.FC<ActiveMoveCardProps> = React.memo(({
  currentMoveIndex,
  lastMove,
  currentAnnotation,
  evaluation,
  engineBestMove,
  interactiveTrial,
}) => {
  const getBadgeColorClass = (evalType?: string) => {
    switch (evalType) {
      case 'Brilian':
      case 'Langkah Brilian':
        return 'bg-cyan-500 text-white';
      case 'Terbaik':
      case 'Langkah Terbaik':
        return 'bg-emerald-600 text-white';
      case 'Teori':
        return 'bg-blue-600 text-white';
      case 'Bagus':
        return 'bg-green-600 text-white';
      case 'Langkah Paksaan':
        return 'bg-indigo-600 text-white';
      case 'Ketidakakuratan':
        return 'bg-yellow-500 text-neutral-900';
      case 'Kesalahan':
        return 'bg-orange-600 text-white';
      case 'Blunder':
        return 'bg-red-600 text-white';
      case 'Skakmat':
        return 'bg-amber-400 text-neutral-950 font-black';
      default:
        return 'bg-neutral-800 text-neutral-200';
    }
  };

  return (
    <div className="bg-neutral-900 text-white rounded-2xl shadow-sm p-3.5 relative overflow-hidden flex flex-col gap-2.5 border border-neutral-800">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>

      {/* Top Engine & Header row */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-300">
            {interactiveTrial ? 'Variasi Percobaan' : 'Analisis Langkah'}
          </span>
        </div>

        {/* Engine Evaluation & Move Quality Badge */}
        <div className="flex items-center gap-1.5">
          {evaluation && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-neutral-800 rounded-md border border-neutral-700/80">
              <span className="text-[9px] text-neutral-400 font-mono uppercase">SF</span>
              <span className={`text-xs font-bold font-mono ${
                evaluation.startsWith('+') ? 'text-emerald-400' :
                evaluation.startsWith('-') ? 'text-rose-400' : 'text-neutral-200'
              }`}>
                {evaluation}
              </span>
            </div>
          )}
          {lastMove && currentAnnotation?.evaluation && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${getBadgeColorClass(currentAnnotation.evaluation)}`}>
              {currentAnnotation.evaluation}
            </span>
          )}
        </div>
      </div>

      {/* Main Move Narrative & Annotation */}
      {currentMoveIndex === -1 && !interactiveTrial ? (
        <div className="py-1">
          <p className="text-neutral-300 text-xs leading-relaxed">
            Gunakan tombol <strong className="text-white font-semibold">Putar / Langkah</strong> di bawah atau panah keyboard untuk menelusuri analisis.
          </p>
        </div>
      ) : interactiveTrial ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Langkah Percobaan: <span className="font-mono text-white ml-1">{interactiveTrial.move.san}</span>
            </span>
          </div>
          <p className="text-neutral-300 text-xs leading-relaxed">
            Variasi kustom dari langkah <strong className="text-white font-mono">{interactiveTrial.move.san}</strong>. Mesin Stockfish sedang menganalisis implikasi taktis posisi ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">
              Langkah {currentMoveIndex + 1}:
              <span className="text-white font-mono ml-1.5 text-sm">{lastMove?.san}</span>
            </span>
            <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700/50">
              {lastMove?.color === 'w' ? 'Giliran Putih' : 'Giliran Hitam'}
            </span>
          </div>

          <p className="text-neutral-200 text-xs leading-relaxed">
            {currentAnnotation?.annotation}
          </p>

          {/* Engine Strategic Recommendation Alternative */}
          {currentAnnotation?.alternatives && (
            <div className="p-2 bg-neutral-800/90 border border-neutral-700/80 rounded-xl flex items-start gap-1.5 text-xs text-neutral-300 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{currentAnnotation.alternatives}</span>
            </div>
          )}

          {/* Best Engine Move Indication */}
          {engineBestMove && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saran Mesin: {engineBestMove.from} → {engineBestMove.to}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ActiveMoveCard.displayName = 'ActiveMoveCard';
