export const DEFAULT_THRESHOLDS = {
  blunder: 20.0,
  mistake: 10.0,
  inaccuracy: 5.0,
};

export function classifyMove(
  winPercentBefore,
  winPercentAfter,
  isBestMove,
  isBookMove,
  thresholds = DEFAULT_THRESHOLDS
) {
  const loss = Math.max(0, winPercentBefore - winPercentAfter);

  if (isBookMove) return { label: "Book", loss };
  if (isBestMove) return { label: "Best", loss };
  if (loss >= thresholds.blunder) return { label: "Blunder", loss };
  if (loss >= thresholds.mistake) return { label: "Mistake", loss };
  if (loss >= thresholds.inaccuracy) return { label: "Inaccuracy", loss };
  if (loss < 1.0) return { label: "Excellent", loss };
  return { label: "Good", loss };
}

export const LABEL_ID = {
  Blunder: "Blunder",
  Mistake: "Kesalahan",
  Inaccuracy: "Ketidakakuratan",
  Good: "Bagus",
  Excellent: "Bagus",
  Best: "Terbaik",
  Book: "Teori",
};
