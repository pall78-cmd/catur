import { LABEL_ID } from "./moveClassifier.js";

/**
 * Builds a highly detailed chess commentary divided into subjective and objective analysis
 */
export function explainMove({
  moveSan,
  classification,
  winPercentLoss,
  isBookMove,
  openingName,
  motifs = [],
  bestLineSan = [],
}) {
  const label = LABEL_ID[classification] || classification;
  const loss = Math.round(winPercentLoss * 10) / 10;
  
  const comments = [];

  // Start with a natural tactical intro depending on classification
  if (classification === "Book" || isBookMove) {
    if (openingName) {
      comments.push(`Langkah buku teori standar. Mengikuti pembukaan "${openingName}" untuk memperebutkan petak strategis di pusat papan catur.`);
    } else {
      comments.push("Langkah buku teori standar (Book Move) untuk mengembangkan perwira dan memperebutkan kontrol pusat papan.");
    }
  } else if (classification === "Brilliant" || classification === "Brilian") {
    comments.push(`Langkah luar biasa brilian dengan memainkan ${moveSan}! Ini menunjukkan kalkulasi taktis tajam atau pengorbanan material jenius yang mempersulit pertahanan musuh.`);
  } else if (classification === "Best" || classification === "Terbaik") {
    comments.push(`Langkah terbaik yang sangat akurat dari segi posisi. Mempertahankan kontrol papan, meningkatkan koordinasi perwira, dan membatasi opsi serangan balik musuh.`);
  } else if (classification === "Excellent" || classification === "Sangat Bagus") {
    comments.push(`Langkah yang sangat bagus! Menjaga momentum permainan tetap di tangan Anda, memperkuat posisi, dan melanjutkan rencana ofensif dengan solid.`);
  } else if (classification === "Good" || classification === "Bagus") {
    comments.push(`Langkah taktis yang solid dan aman. Membantu menjaga keutuhan struktur bidak serta stabilitas koordinasi antarperwira.`);
  } else if (classification === "Inaccuracy" || classification === "Ketidakakuratan") {
    comments.push(`Langkah kurang akurat (Inaccuracy). Ada pilihan langkah yang lebih efisien untuk mempertahankan tekanan atau membatasi serangan balik lawan.`);
  } else if (classification === "Mistake" || classification === "Kesalahan") {
    comments.push(`Kesalahan taktis (Mistake). Mengurangi dominasi permainan, merugikan tempo, atau memberikan musuh ruang untuk merajut inisiatif.`);
  } else if (classification === "Blunder") {
    comments.push(`Blunder serius! Langkah ini melemahkan pertahanan secara drastis, berisiko mengorbankan material penting tanpa kompensasi yang sepadan.`);
  } else if (classification === "Forced" || classification === "Langkah Paksaan") {
    comments.push(`Langkah paksaan kritis. Satu-satunya langkah legal yang dapat diambil untuk keluar dari ancaman lawan.`);
  } else {
    comments.push(`Langkah ${moveSan} yang solid untuk mempertahankan koordinasi.`);
  }

  // Add loss percentage or dynamic values naturally without headers
  if (classification !== "Book" && !isBookMove) {
    if (loss > 2.0) {
      comments.push(`Kalkulasi mesin mendeteksi penurunan peluang kemenangan sebesar ${loss}%.`);
    } else if (loss > 0) {
      comments.push(`Langkah ini membuat peluang menang sedikit berkurang sekitar ${loss}%.`);
    } else {
      comments.push(`Langkah presisi tinggi yang mempertahankan kontrol posisi strategis.`);
    }
  }

  // Tactical motifs
  if (motifs.includes("fork")) {
    comments.push("Terdapat ancaman motif Garpu (Fork), di mana satu perwira menargetkan dua sasaran penting musuh secara bersamaan.");
  }
  if (motifs.includes("hanging_piece_created")) {
    comments.push("Langkah ini memicu perwira gantung pada pertahanan musuh yang kini tidak lagi terlindungi.");
  }
  if (motifs.includes("left_piece_hanging")) {
    comments.push("Perlu berhati-hati karena langkah ini membiarkan salah satu perwira Anda dalam kondisi gantung tanpa perlindungan.");
  }
  if (motifs.includes("check")) {
    comments.push("Melancarkan skak langsung ke raja lawan untuk mendikte ritme permainan.");
  }

  if (bestLineSan && bestLineSan.length > 0) {
    comments.push(`Saran kelanjutan jalur terbaik: ${bestLineSan.join(" → ")}.`);
  }

  return comments.join(" ");
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
