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
  thresholds = DEFAULT_THRESHOLDS,
  motifs = []
) {
  const loss = Math.max(0, winPercentBefore - winPercentAfter);

  if (isBookMove) return { label: "Book", loss };

  const isCapture = motifs.includes("capture");
  const isCheck = motifs.includes("check");

  // Heuristic for Brilliant Move (!!):
  // A best move (or highly positive move) that is a capture or a check in an advantageous position.
  if ((isBestMove || loss <= 0) && winPercentAfter > 60.0 && (isCapture || isCheck)) {
    return { label: "Brilliant", loss };
  }

  // If it's the best move under normal circumstances
  if (isBestMove) {
    return { label: "Best", loss };
  }

  // Heuristic for Interesting Move (!?):
  // Not the absolute best move, but very low loss (< 2.5%) and involves a sharp check or capture.
  if (loss > 0 && loss < 2.5 && (isCapture || isCheck)) {
    return { label: "Interesting", loss };
  }

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
  Excellent: "Sangat Bagus",
  Best: "Terbaik",
  Book: "Teori",
  Brilliant: "Brilian",
  Interesting: "Menarik",
};
