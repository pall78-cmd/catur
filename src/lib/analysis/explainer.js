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

  // 1. Objective Analysis (Engine, Math, Stats)
  const objectiveParts = [];
  const loss = Math.round(winPercentLoss * 10) / 10;

  if (classification === "Book" || isBookMove) {
    objectiveParts.push(`Langkah Buku Teori (Book Move).`);
    if (openingName) {
      objectiveParts.push(`Mengikuti pembukaan standard "${openingName}".`);
    } else {
      objectiveParts.push(`Mengikuti teori pembukaan standar.`);
    }
  } else {
    objectiveParts.push(`Evaluasi langkah: ${label}.`);
    if (loss > 0) {
      objectiveParts.push(`Peluang menang berkurang sebesar ${loss}% berdasarkan kalkulasi kedalaman engine.`);
    } else {
      objectiveParts.push(`Langkah akurat yang mempertahankan atau meningkatkan kontrol posisi.`);
    }
    
    if (bestLineSan && bestLineSan.length > 0) {
      objectiveParts.push(`Rekomendasi jalur terbaik: ${bestLineSan.join(" → ")}.`);
    }
  }

  // 2. Subjective Analysis (Tactical commentary, strategy)
  const subjectiveParts = [];
  
  if (classification === "Book" || isBookMove) {
    subjectiveParts.push("Mengembangkan perwira ke petak-petak strategis standar untuk menguasai pusat papan catur (center block) dan mempersiapkan keamanan raja (rokade).");
  } else if (classification === "Brilliant" || classification === "Brilian") {
    subjectiveParts.push("💎 LUAR BIASA! Ini adalah langkah brilian (langkah jenius atau pengorbanan material) yang sangat sulit dihitung. Anda berhasil menemukan ancaman taktis tersembunyi yang merusak koordinasi lawan!");
  } else if (classification === "Best" || classification === "Terbaik") {
    subjectiveParts.push("⭐ Langkah paling optimal di posisi ini. Menunjukkan pemahaman posisi yang solid, membatasi kontra-permainan lawan, dan meningkatkan tekanan strategis.");
  } else if (classification === "Excellent" || classification === "Sangat Bagus") {
    subjectiveParts.push("Langkah yang sangat bagus! Menjaga tempo permainan, mengamankan perwira, dan melanjutkan rencana ofensif/defensif dengan percaya diri.");
  } else if (classification === "Good" || classification === "Bagus") {
    subjectiveParts.push("Langkah taktis yang solid dan aman. Membantu struktur bidak tetap utuh dan mempertahankan koordinasi antar perwira di area kritis.");
  } else if (classification === "Inaccuracy" || classification === "Ketidakakuratan") {
    subjectiveParts.push("?! Langkah kurang akurat (Inaccuracy). Ada opsi yang lebih efisien untuk mempertahankan inisiatif atau membatasi serangan balik lawan. Langkah ini memberi sedikit ruang gerak bagi musuh.");
  } else if (classification === "Mistake" || classification === "Kesalahan") {
    subjectiveParts.push("? Kesalahan taktis (Mistake). Menurunkan tekanan permainan, merugikan tempo, atau memberikan lawan kesempatan untuk merusak pertahanan Anda.");
  } else if (classification === "Blunder") {
    subjectiveParts.push("?? Blunder serius! Langkah berbahaya yang melemahkan posisi secara drastis, mengorbankan materi penting tanpa kompensasi, atau membiarkan taktik musuh langsung mematikan.");
  } else if (classification === "Forced" || classification === "Langkah Paksaan") {
    subjectiveParts.push("Satu-satunya langkah legal yang dapat dimainkan di posisi kritis ini untuk keluar dari ancaman.");
  }

  // Additional tactical motifs analysis
  if (motifs.includes("fork")) {
    subjectiveParts.push("⚠️ Motif Garpu (Fork) terdeteksi! Satu perwira mengancam dua target musuh secara bersamaan, menciptakan keuntungan material tak terhindarkan.");
  }
  if (motifs.includes("hanging_piece_created")) {
    subjectiveParts.push("🎯 Menciptakan perwira gantung (Hanging Piece) pada pertahanan musuh yang kini tidak memiliki perlindungan sama sekali.");
  }
  if (motifs.includes("left_piece_hanging")) {
    subjectiveParts.push("🔴 Peringatan: Meninggalkan perwira sendiri dalam kondisi gantung tanpa perlindungan, memberi sasaran empuk untuk dimakan lawan.");
  }
  if (motifs.includes("check")) {
    subjectiveParts.push("⚔️ Melancarkan serangan langsung (Skak) ke arah Raja lawan untuk mengganggu rajutan koordinasi musuh.");
  }

  const objectiveText = objectiveParts.join(" ");
  const subjectiveText = subjectiveParts.join(" ");

  return `📊 [ANALISIS OBJEKTIF]:\n${objectiveText}\n\n🧠 [ANALISIS SUBJEKTIF]:\n${subjectiveText}`;
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
