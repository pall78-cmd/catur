import React from 'react';
import { 
  SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward, 
  RotateCcw, Volume2, VolumeX 
} from 'lucide-react';

interface ChessControlsProps {
  currentMoveIndex: number;
  totalMoves: number;
  isPlaying: boolean;
  isMuted: boolean;
  boardOrientation: 'white' | 'black';
  onFirst: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onLast: () => void;
  onFlipBoard: () => void;
  onToggleMute: () => void;
  onSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChessControls: React.FC<ChessControlsProps> = React.memo(({
  currentMoveIndex,
  totalMoves,
  isPlaying,
  isMuted,
  boardOrientation,
  onFirst,
  onPrev,
  onTogglePlay,
  onNext,
  onLast,
  onFlipBoard,
  onToggleMute,
  onSliderChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-3">
      {/* Navigation & Action Buttons */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onFirst}
            disabled={currentMoveIndex <= -1}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Awal Game (Awal)"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={onPrev}
            disabled={currentMoveIndex <= -1}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Langkah Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={onTogglePlay}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          title={isPlaying ? "Jeda Otomatis (Spasi)" : "Putar Otomatis (Spasi)"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span className="text-xs font-semibold">Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span className="text-xs font-semibold">Putar</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onNext}
            disabled={currentMoveIndex >= totalMoves - 1}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Langkah Berikutnya (Panah Kanan)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={onLast}
            disabled={currentMoveIndex >= totalMoves - 1}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Akhir Game (Akhir)"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-neutral-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFlipBoard}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title="Balik Sudut Pandang Papan (F)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-neutral-500 min-w-[50px]">
          {currentMoveIndex + 1} / {totalMoves}
        </span>
        <input
          type="range"
          min="-1"
          max={totalMoves - 1}
          value={currentMoveIndex}
          onChange={onSliderChange}
          className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
        />
      </div>
    </div>
  );
});

ChessControls.displayName = 'ChessControls';
