// Chess Openings Database and Terminology Engine

export interface ChessOpening {
  eco: string;
  name: string;
  moves: string[]; // SAN sequence e.g. ["e4", "e5", "Nf3", "Nc6"]
  description: string;
  keyConcepts: string[];
}

export const OPENINGS_DATABASE: ChessOpening[] = [
  {
    eco: "C60",
    name: "Pembukaan Ruy Lopez (Spanish Game)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    description: "Pembukaan klasik paling terkenal yang menekan Kuda hitam pengawal petak e5, mempersiapkan dominasi pusat dan rokade cepat.",
    keyConcepts: ["Tekanan ke Kuda c6", "Keamanan Raja", "Kontrol Petak Pusat e4/d4"]
  },
  {
    eco: "C50",
    name: "Pembukaan Italia (Italian Game / Giuoco Piano)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    description: "Fokus membidik petak terlemah Hitam yaitu f7, mengincar serangan kombinasi cepat atau pembangunan pusat d3/c3.",
    keyConcepts: ["Serangan Petak f7", "Pengembangan Perwira Ringan", "Sistem Giuoco Piano"]
  },
  {
    eco: "C52",
    name: "Gambit Evans (Evans Gambit)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
    description: "Gambit agresif dengan mengorbankan bidak b4 untuk mempercepat tempo penguasaan pusat d4 dan lajur serangan c/d/e.",
    keyConcepts: ["Inisiatif Tempo", "Pengorbanan Bidak Strategis", "Penguasaan Pusat Cepat"]
  },
  {
    eco: "B20",
    name: "Pertahanan Sisilia (Sicilian Defense)",
    moves: ["e4", "c5"],
    description: "Respon paling dinamis dan populer melawan 1.e4. Hitam langsung menantang petak pusat d4 dari sayap menteri.",
    keyConcepts: ["Asimetri Struktur Bidak", "Serangan Balik Sayap Menteri", "Perebutan Lajur c Open"]
  },
  {
    eco: "B90",
    name: "Sisilia Najdorf (Sicilian Najdorf)",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    description: "Variasi Sisilia legendaris pilihan Fischer dan Kasparov, mencegah loncatan Nb5/Bb5 dan mempersiapkan e5/e6 fleksibel.",
    keyConcepts: ["Pencegahan Nb5", "Struktur Scheveningen/e5", "Serangan Taktis Tajam"]
  },
  {
    eco: "B70",
    name: "Sisilia Naga (Sicilian Dragon)",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
    description: "Hitam menempatkan Gajah di g6 (Fianchetto) menyerupai rasi bintang Naga, membidik diagonal h8-a1 yang sangat berbahaya.",
    keyConcepts: ["Fianchetto Gajah g7", "Serangan Sisi Bertentangan", "Diagonal Panjang h8-a1"]
  },
  {
    eco: "C00",
    name: "Pertahanan Prancis (French Defense)",
    moves: ["e4", "e6"],
    description: "Pertahanan kokoh dengan merencanakan d5. Mengakibatkan struktur bidak terkunci yang memicu pertempuran rantai bidak.",
    keyConcepts: ["Rantai Bidak e4-d4 vs e6-d5", "Tekanan ke d4/c5", "Gajah Buruk c8"]
  },
  {
    eco: "B10",
    name: "Pertahanan Caro-Kann (Caro-Kann Defense)",
    moves: ["e4", "c6"],
    description: "Pertahanan sangat solid mendesak d5 tanpa mengunci Gajah c8. Dikenal memiliki struktur endgame yang sangat aman.",
    keyConcepts: ["Persiapan d5", "Struktur Bidak Bebas Gajah", "Soliditas Pertahanan"]
  },
  {
    eco: "D06",
    name: "Gambit Menteri (Queen's Gambit)",
    moves: ["d4", "d5", "c4"],
    description: "Putih menawarkan bidak c4 untuk menukar bidak samping dengan bidak pusat d5 Hitam guna mengontrol ruang pusat.",
    keyConcepts: ["Kontrol Pusat Ruang", "Tekanan Lajur c", "Gambit Posisional"]
  },
  {
    eco: "D30",
    name: "Gambit Menteri Ditolak (Queen's Gambit Declined)",
    moves: ["d4", "d5", "c4", "e6"],
    description: "Hitam menolak bidak dan memperkokoh poin d5, mengarah ke pertempuran strategi posisi yang mendalam.",
    keyConcepts: ["Pertahanan Benteng d5", "Rantai Bidak", "Kendalikan Pusat"]
  },
  {
    eco: "D10",
    name: "Pertahanan Slav (Slav Defense)",
    moves: ["d4", "d5", "c4", "c6"],
    description: "Hitam mempertahankan d5 dengan c6, menjaga diagonal Gajah c8 tetap terbuka untuk pengembangan perwira.",
    keyConcepts: ["Soliditas c6/d5", "Kebebasan Gajah c8", "Rencana e6 / dxc4"]
  },
  {
    eco: "E60",
    name: "Pertahanan India Raja (King's Indian Defense)",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"],
    description: "Pertahanan hipermodern tempat Hitam membiarkan Putih menguasai pusat lalu melancarkan serangan balasan dahsyat e5/f5.",
    keyConcepts: ["Fianchetto Gajah g7", "Serangan Balik e5/f5", "Struktur Terkunci Penuh Taktik"]
  },
  {
    eco: "E20",
    name: "Pertahanan Nimzo-India (Nimzo-Indian Defense)",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    description: "Hitam memin Kuda c3 untuk mencegah Putih memainkan 4.e4, mengendalikan petak e4 secara tidak langsung.",
    keyConcepts: ["Pin Kuda c3", "Kontrol Petak e4", "Peluang Bidak Tumpuk Putih"]
  },
  {
    eco: "A45",
    name: "Sistem London (London System)",
    moves: ["d4", "d5", "Bf4"],
    description: "Sistem pembukaan sangat populer, konsisten, dan solid untuk Putih dengan mengembangkan Gajah ke f4 sebelum e3.",
    keyConcepts: ["Segitiga Bidak c3-d4-e3", "Gajah Kuat f4", "Posisi Bebas Blunder"]
  },
  {
    eco: "A10",
    name: "Pembukaan Inggris (English Opening)",
    moves: ["c4"],
    description: "Langkah sayap menteri mengontrol petak d5 dari jauh tanpa menentukan nasib bidak d4/e4 terlalu cepat.",
    keyConcepts: ["Kontrol Petak d5", "Fleksibilitas Struktur", "Pendekatan Hipermodern"]
  },
  {
    eco: "B00",
    name: "Pertahanan Skandinavia (Scandinavian Defense)",
    moves: ["e4", "d5"],
    description: "Hitam langsung menantang e4 pada langkah pertama. Bidak e4 ditangkap dan Menteri Hitam aktif sejak awal.",
    keyConcepts: ["Tantangan Pusat Langkah 1", "Menteri Aktif", "Struktur Bidak Solid"]
  },
  {
    eco: "A04",
    name: "Pembukaan Reti (Reti Opening)",
    moves: ["Nf3"],
    description: "Langkah Kuda f3 yang fleksibel mengontrol e5 dan d4, menjaga semua opsi pembukaan tetap terbuka.",
    keyConcepts: ["Fleksibilitas Tinggi", "Pencegahan 1...e5", "Transisi Sistem"]
  },
  {
    eco: "C42",
    name: "Pertahanan Petrov (Petrov's Defense)",
    moves: ["e4", "e5", "Nf3", "Nf6"],
    description: "Hitam membalas ancaman e5 dengan menyerang bidak e4 Putih secara simetris.",
    keyConcepts: ["Simetri Taktis", "Soliditas Tinggi", "Transisi Endgame"]
  },
  {
    eco: "C45",
    name: "Pembukaan Skotlandia (Scotch Game)",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4"],
    description: "Putih langsung membuka pusat pada langkah ketiga, memicu pertukaran bidak cepat dan pertempuran perwira terbuka.",
    keyConcepts: ["Pembukaan Pusat Cepat", "Jalur Terbuka d4", "Inisiatif Perwira"]
  },
  {
    eco: "C23",
    name: "Pembukaan Wina (Vienna Game)",
    moves: ["e4", "e5", "Nc3"],
    description: "Putih memperkuat petak d5 dan e4 dengan Kuda c3 sebelum menentukan arah serangan dengan f4 atau Bc4.",
    keyConcepts: ["Perkembangan Nc3", "Potensi Gambit f4", "Penguasaan Pusat Fleksibel"]
  },
  {
    eco: "C47",
    name: "Pembukaan Empat Kuda (Four Knights Game)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"],
    description: "Pembukaan sangat simetris dan aman tempat kedua pihak mengembangkan seluruh Kuda ke petak alami.",
    keyConcepts: ["Perkembangan Simetris", "Kontrol Petak d4/d5", "Keamanan Awal Game"]
  },
  {
    eco: "C30",
    name: "Gambit Raja (King's Gambit)",
    moves: ["e4", "e5", "f4"],
    description: "Gambit romantik klasik mengorbankan bidak f4 untuk membongkar pusat Hitam dan menguasai lajur f.",
    keyConcepts: ["Serangan Agresif Lajur f", "Pengorbanan Bidak f4", "Serangan Taktis Tajam"]
  },
  {
    eco: "B07",
    name: "Pertahanan Pirc (Pirc Defense)",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"],
    description: "Pertahanan hipermodern fleksibel tempat Hitam membiarkan Putih membangun pusat bidak besar lalu menyerang balik.",
    keyConcepts: ["Fianchetto g7", "Serangan Balik c5/e5", "Pendekatan Hipermodern"]
  },
  {
    eco: "B01",
    name: "Pertahanan Skandinavia (Scandinavian Defense)",
    moves: ["e4", "d5"],
    description: "Hitam langsung menantang e4 pada langkah pertama. Bidak e4 ditangkap dan Menteri Hitam aktif sejak awal.",
    keyConcepts: ["Tantangan Pusat Langkah 1", "Menteri Aktif", "Struktur Bidak Solid"]
  },
  {
    eco: "A04",
    name: "Pembukaan Reti (Reti Opening)",
    moves: ["Nf3"],
    description: "Langkah Kuda f3 yang fleksibel mengontrol e5 dan d4, menjaga semua opsi pembukaan tetap terbuka.",
    keyConcepts: ["Fleksibility Tinggi", "Pencegahan 1...e5", "Transisi Sistem"]
  },
  {
    eco: "E00",
    name: "Pembukaan Catalan (Catalan Opening)",
    moves: ["d4", "Nf6", "c4", "e6", "g3"],
    description: "Putih menggabungkan Gambit Menteri dengan Fianchetto Gajah g2 untuk menguasai diagonal panjang h1-a8.",
    keyConcepts: ["Fianchetto Gajah g2", "Diagonal Panjang a8-h1", "Tekanan Posisional Sayap Raja"]
  },
  {
    eco: "E12",
    name: "Pertahanan India Menteri (Queen's Indian Defense)",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"],
    description: "Hitam mengontrol petak e4 secara hipermodern lewat b6 dan Bb7 tanpa mendesak d5 terlalu dini.",
    keyConcepts: ["Fianchetto Bb7", "Kontrol Petak e4", "Struktur Sayap Menteri Solid"]
  },
  {
    eco: "C20",
    name: "Pembukaan Raja (King's Pawn Game)",
    moves: ["e4", "e5"],
    description: "Pertempuran terbuka paling fundamental dalam catur, kedua pihak memperebutkan petak pusat d4/d5.",
    keyConcepts: ["Kontrol Pusat", "Pengembangan Perwira", "Jalur Terbuka"]
  }
];

export function detectOpening(historySan: string[]): ChessOpening | null {
  if (!historySan || historySan.length === 0) return null;

  let bestMatch: ChessOpening | null = null;
  let maxMatchLength = 0;

  for (const opening of OPENINGS_DATABASE) {
    const len = opening.moves.length;
    if (historySan.length >= len) {
      let isMatch = true;
      for (let i = 0; i < len; i++) {
        if (historySan[i] !== opening.moves[i]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch && len > maxMatchLength) {
        maxMatchLength = len;
        bestMatch = opening;
      }
    }
  }

  return bestMatch;
}
