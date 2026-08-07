import { LABEL_ID } from "./moveClassifier.js";

export function explainMove({
  moveSan,
  classification,
  winPercentLoss,
  isBookMove,
  openingName,
  motifs = [],
  bestLineSan = [],
}) {
  const parts = [];
  const label = LABEL_ID[classification] || classification;
  parts.push(`${moveSan} — ${label}.`);

  if (classification === "Book") {
    if (openingName) {
      parts.push(
        `Bagian dari teori ${openingName}, masih di jalur yang dikenal dan teruji.`
      );
    }
  } else {
    const loss = Math.round(winPercentLoss * 10) / 10;
    if (loss >= 1.0) {
      parts.push(`Langkah ini menurunkan peluang menang sekitar ${loss}%.`);
    }

    const isProblematic = ["Blunder", "Mistake", "Inaccuracy"].includes(
      classification
    );
    if (isProblematic && bestLineSan.length > 0) {
      parts.push(`Mesin lebih suka ${bestLineSan[0]} di posisi ini.`);
    }
  }

  if (motifs.includes("fork")) {
    parts.push(
      "Langkah ini kelihatannya bikin fork — satu bidak nyerang dua target sekaligus, worth di-cek manual."
    );
  }
  if (motifs.includes("hanging_piece_created")) {
    parts.push("Ada bidak lawan yang jadi nggak terlindungi setelah langkah ini.");
  }
  if (
    motifs.includes("left_piece_hanging") &&
    ["Blunder", "Mistake"].includes(classification)
  ) {
    parts.push("Kelihatannya ada bidak sendiri yang ketinggalan nggak kebela.");
  }
  if (motifs.includes("check")) {
    parts.push("Langkah ini skak.");
  }

  return parts.join(" ");
}

export function buildGameSummary({
  whiteAccuracy,
  blackAccuracy,
  whiteBlunders,
  whiteMistakes,
  whiteInaccuracies,
  blackBlunders,
  blackMistakes,
  blackInaccuracies,
}) {
  const fmt = (n) => Math.round(n * 10) / 10;
  return [
    "=== Ringkasan Analisis Game ===",
    `Akurasi Putih: ${fmt(whiteAccuracy)}%  |  Akurasi Hitam: ${fmt(blackAccuracy)}%`,
    `Putih — Blunder: ${whiteBlunders}, Kesalahan: ${whiteMistakes}, Kurang Akurat: ${whiteInaccuracies}`,
    `Hitam — Blunder: ${blackBlunders}, Kesalahan: ${blackMistakes}, Kurang Akurat: ${blackInaccuracies}`,
  ].join("\n");
}
