import React from 'react';

interface FenPgnInputProps {
  customInput: string;
  setCustomInput: (val: string) => void;
  onLoadInput: () => void;
  onResetGame: () => void;
  isCustomMode: boolean;
  isModifiedGame: boolean;
  inputFeedback: { type: 'success' | 'error'; message: string } | null;
}

export const FenPgnInput: React.FC<FenPgnInputProps> = React.memo(({
  customInput,
  setCustomInput,
  onLoadInput,
  onResetGame,
  isModifiedGame,
  inputFeedback,
}) => {
  return (
    <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
        Muat Posisi / Game (FEN / PGN)
      </label>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          placeholder="Tempelkan FEN atau PGN di sini..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onLoadInput();
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 bg-neutral-50/50"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onLoadInput}
            className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Muat FEN / PGN
          </button>
          {isModifiedGame && (
            <button
              onClick={onResetGame}
              className="px-2.5 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              title="Kembali ke Game Tutorial Awal"
            >
              Reset Game
            </button>
          )}
        </div>
      </div>

      {inputFeedback && (
        <div
          className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
            inputFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {inputFeedback.message}
        </div>
      )}
    </div>
  );
});

FenPgnInput.displayName = 'FenPgnInput';
