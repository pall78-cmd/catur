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
  playSpeedMs?: number;
  onFirst: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onLast: () => void;
  onFlipBoard: () => void;
  onToggleMute: () => void;
  onSpeedChange?: (speedMs: number) => void;
  onSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChessControls: React.FC<ChessControlsProps> = React.memo(({
  currentMoveIndex,
  totalMoves,
  isPlaying,
  isMuted,
  boardOrientation,
  playSpeedMs = 2800,
  onFirst,
  onPrev,
  onTogglePlay,
  onNext,
  onLast,
  onFlipBoard,
  onToggleMute,
  onSpeedChange,
  onSliderChange,
}) => {
  return (
    <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-2xs border border-neutral-200/90 flex flex-col gap-2">
      {/* Navigation & Action Controls Bar */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
        {/* Main Playback Cluster: First, Prev, Play/Pause, Next, Last */}
        <div className="flex items-center gap-0.5 bg-neutral-100/90 p-1 rounded-lg border border-neutral-200/70 shrink-0">
          <button
            onClick={onFirst}
            disabled={currentMoveIndex <= -1}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Awal Game (Awal)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onPrev}
            disabled={currentMoveIndex <= -1}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Langkah Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
            title={isPlaying ? "Jeda Otomatis (Spasi)" : "Putar Otomatis (Spasi)"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] font-semibold">Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] font-semibold">Putar</span>
              </>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={currentMoveIndex >= totalMoves - 1}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Langkah Berikutnya (Panah Kanan)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLast}
            disabled={currentMoveIndex >= totalMoves - 1}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Akhir Game (Akhir)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector & Utilities (Flip / Mute) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {onSpeedChange && (
            <select
              value={playSpeedMs}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="text-[11px] bg-neutral-100/90 border border-neutral-200/80 text-neutral-700 font-semibold px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
              title="Kecepatan Putar Analisis"
            >
              <option value={3800}>3.8s (Santai)</option>
              <option value={2800}>2.8s (Normal)</option>
              <option value={1800}>1.8s (Cepat)</option>
              <option value={1000}>1.0s (Sangat Cepat)</option>
            </select>
          )}

          <div className="flex items-center gap-0.5 bg-neutral-100/90 p-1 rounded-lg border border-neutral-200/70">
            <button
              onClick={onFlipBoard}
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Balik Sudut Pandang Papan (F)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleMute}
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md transition-colors cursor-pointer"
              title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="flex items-center gap-2.5 pt-0.5">
        <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0 min-w-[42px] text-right">
          {currentMoveIndex + 1}/{totalMoves}
        </span>
        <input
          type="range"
          min="-1"
          max={totalMoves - 1}
          value={currentMoveIndex}
          onChange={onSliderChange}
          className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200/80 rounded-lg"
        />
      </div>
    </div>
  );
});

ChessControls.displayName = 'ChessControls';
