import React from 'react';
import { Sparkles, RefreshCw, Database } from 'lucide-react';

interface FenPgnInputProps {
  customInput: string;
  setCustomInput: (val: string) => void;
  onLoadInput: () => void;
  onResetGame: () => void;
  isCustomMode: boolean;
  isModifiedGame: boolean;
  inputFeedback: { type: 'success' | 'error'; message: string } | null;
  onSelectPreset?: (pgnString: string) => void;
  onOpenLibrary?: () => void;
}

const PRESET_GAMES = [
  {
    name: 'Kasparov vs Topalov (1999)',
    pgn: `[Event "Hoogovens Group A"]
[Site "Wijk aan Zee NED"]
[Date "1999.01.20"]
[Round "4"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0`,
  },
  {
    name: 'Opera Game: Morphy vs Brunswick (1858)',
    pgn: `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.11.02"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
];

export const FenPgnInput: React.FC<FenPgnInputProps> = React.memo(({
  customInput,
  setCustomInput,
  onLoadInput,
  onResetGame,
  isModifiedGame,
  inputFeedback,
  onSelectPreset,
  onOpenLibrary,
}) => {
  return (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl shadow-2xs border border-neutral-200/90 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
          Muat Posisi / Game (FEN / PGN)
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetGame}
            className="text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200/80 flex items-center gap-1 transition-colors cursor-pointer"
            title="Hapus seluruh langkah dan mulai game catur kustom baru dari posisi awal"
          >
            <RefreshCw className="w-3 h-3 text-rose-600" />
            <span>Kosongkan Langkah / Game Baru</span>
          </button>
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200/80 flex items-center gap-1 transition-colors cursor-pointer"
              title="Buka Koleksi PGN tersimpan di IndexedDB"
            >
              <Database className="w-3 h-3 text-indigo-600" />
              <span>Koleksi IndexedDB</span>
            </button>
          )}
        </div>
      </div>

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
          className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800 bg-neutral-50/50 transition-all"
        />
        <button
          onClick={onLoadInput}
          className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          Muat Data
        </button>
      </div>

      {/* Preset Quick Loader */}
      {onSelectPreset && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Contoh Game:
          </span>
          {PRESET_GAMES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPreset(preset.pgn)}
              className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg border border-neutral-200/60 transition-all cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      {inputFeedback && (
        <div
          className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all ${
            inputFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {inputFeedback.message}
        </div>
      )}
    </div>
  );
});

FenPgnInput.displayName = 'FenPgnInput';
