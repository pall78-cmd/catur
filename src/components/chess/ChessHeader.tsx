import React, { useState } from 'react';
import { BookOpen, Command, Keyboard, History, X } from 'lucide-react';
import { ChangelogModal } from './ChangelogModal';

interface ChessHeaderProps {
  title: string;
  detectedOpening: string | null;
  onOpenPerformance?: () => void;
}

export const ChessHeader: React.FC<ChessHeaderProps> = React.memo(({ title, detectedOpening, onOpenPerformance }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <header className="mb-4 text-center flex flex-col items-center">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-100 rounded-full text-[10px] font-semibold text-neutral-600 mb-2 border border-neutral-200/80">
        <Command className="w-3 h-3 text-neutral-500" />
        <span>Analisis & Walkthrough Catur Interaktif</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 mb-1.5 font-serif">
        {title}
      </h1>

      <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xl">
        {detectedOpening && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-[11px] font-bold shadow-2xs">
            <BookOpen className="w-3 h-3 text-amber-600" />
            {detectedOpening}
          </span>
        )}

        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
        >
          <Keyboard className="w-3 h-3 text-neutral-500" />
          <span>Pintasan</span>
        </button>

        <button
          onClick={() => setShowChangelog(true)}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <History className="w-3 h-3 text-emerald-600" />
          <span>v2.0.0</span>
        </button>
      </div>

      {showShortcuts && (
        <div className="mt-2.5 p-2.5 bg-neutral-900 text-neutral-200 rounded-xl text-xs max-w-md w-full relative shadow-md border border-neutral-800 animate-in fade-in duration-200">
          <button
            onClick={() => setShowShortcuts(false)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="font-bold text-white mb-1 text-left text-[10px] uppercase tracking-wider text-amber-400">
            Pintasan Keyboard:
          </div>
          <div className="grid grid-cols-2 gap-1 text-left text-[11px]">
            <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono border border-neutral-700">← / →</kbd> Langkah Sebelum/Sesudah</div>
            <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono border border-neutral-700">Spasi</kbd> Putar / Jeda</div>
            <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono border border-neutral-700">F / Z</kbd> Balik Papan</div>
            <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono border border-neutral-700">Home/End</kbd> Awal/Akhir Game</div>
          </div>
        </div>
      )}

      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </header>
  );
});

ChessHeader.displayName = 'ChessHeader';
