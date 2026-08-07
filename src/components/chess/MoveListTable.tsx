import React, { useRef, useEffect } from 'react';
import { MovePairItem } from '../../types/chess';

interface MoveListTableProps {
  movePairs: MovePairItem[];
  currentMoveIndex: number;
  onGoToMove: (index: number) => void;
}

export const MoveListTable: React.FC<MoveListTableProps> = React.memo(({
  movePairs,
  currentMoveIndex,
  onGoToMove,
}) => {
  const activeMoveRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeMoveRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeMoveRef.current;
      const elemTop = element.offsetTop;
      const elemBottom = elemTop + element.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;

      if (elemTop < containerTop) {
        container.scrollTop = elemTop;
      } else if (elemBottom > containerBottom) {
        container.scrollTop = elemBottom - container.clientHeight;
      }
    }
  }, [currentMoveIndex]);

  const getEvalBadge = (evalType: string) => {
    switch (evalType) {
      case 'Brilian':
      case 'Langkah Brilian':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-cyan-100 text-cyan-800 rounded-md font-bold shrink-0" title="!! Langkah Brilian (Jenius/Pengorbanan)">💎 !!</span>;
      case 'Terbaik':
      case 'Langkah Terbaik':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 rounded-md font-bold shrink-0" title="! Langkah Terbaik">⭐ !</span>;
      case 'Bagus':
      case 'Langkah Bagus':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-green-100 text-green-800 rounded-md font-bold shrink-0" title="! Langkah Bagus">👍 !</span>;
      case 'Menarik':
      case 'Langkah Menarik':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-800 rounded-md font-bold shrink-0" title="!? Langkah Menarik (Spekulatif/Risiko)">🌀 !?</span>;
      case 'Teori':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-800 rounded-md font-bold shrink-0" title="📖 Buku Teori">📖</span>;
      case 'Ketidakakuratan':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-yellow-100 text-yellow-800 rounded-md font-bold shrink-0" title="?! Ketidakakuratan (Kurang Akurat)">⚠️ ?!</span>;
      case 'Kesalahan':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-orange-100 text-orange-800 rounded-md font-bold shrink-0" title="? Kesalahan (Blunder Kecil/Hilang Tempo)">❓ ?</span>;
      case 'Blunder':
        return <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-red-100 text-red-800 rounded-md font-bold shrink-0" title="?? Blunder Fatal">💥 ??</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col max-h-[280px]">
      <div className="p-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
        <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider">
          Daftar Langkah
        </h3>
        <span className="text-[10px] text-neutral-500 font-medium">
          Klik langkah untuk navigasi
        </span>
      </div>

      <div ref={containerRef} className="overflow-y-auto p-2 divide-y divide-neutral-100 text-xs font-mono min-h-[120px]">
        {movePairs.length === 0 ? (
          <div className="py-8 px-4 text-center text-neutral-400 text-xs font-sans leading-relaxed">
            Belum ada langkah tercatat. Mainkan langkah pertama di papan atau tempelkan FEN/PGN di tab <strong className="text-neutral-600 font-semibold">Impor & Ekspor</strong>.
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.moveNumber} className="grid grid-cols-12 py-1 items-center hover:bg-neutral-50 rounded">
              <span className="col-span-2 text-neutral-400 font-sans font-medium text-center text-[11px]">
                {pair.moveNumber}.
              </span>

              {/* White move column */}
              <div className="col-span-5 pr-1">
                <button
                  ref={currentMoveIndex === pair.whiteIndex ? activeMoveRef : null}
                  onClick={() => onGoToMove(pair.whiteIndex)}
                  className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center justify-between cursor-pointer ${
                    currentMoveIndex === pair.whiteIndex
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'text-neutral-800 hover:bg-neutral-200/60'
                  }`}
                >
                  <span>{pair.white.san}</span>
                  {getEvalBadge(pair.whiteEval)}
                </button>
              </div>

              {/* Black move column */}
              <div className="col-span-5 pl-1">
                {pair.black ? (
                  <button
                    ref={currentMoveIndex === pair.blackIndex ? activeMoveRef : null}
                    onClick={() => onGoToMove(pair.blackIndex!)}
                    className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center justify-between cursor-pointer ${
                      currentMoveIndex === pair.blackIndex
                        ? 'bg-neutral-900 text-white font-bold'
                        : 'text-neutral-800 hover:bg-neutral-200/60'
                    }`}
                  >
                    <span>{pair.black.san}</span>
                    {getEvalBadge(pair.blackEval || '')}
                  </button>
                ) : (
                  <span className="text-neutral-300 px-2">-</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

MoveListTable.displayName = 'MoveListTable';
