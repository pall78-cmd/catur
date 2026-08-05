import { MoveAnalysis, GameOverview } from '../types';

export const pgn = `[Site "Chess.com"]
[Date "2026-08-06"]
[White "Lukasiud"]
[Black "ayamlezatkrispi"]
[Result "0-1"]
[WhiteElo "299"]
[BlackElo "336"]
[TimeControl "600"]

1. e4 Nf6 2. c3 e5 3. d3 d6 4. Nf3 b6 5. Na3 Nc6 6. Nh4 g6 7. Be3 a5 8. Nb5 Rb8 9. Be2 Ba6 10. Na3 h6 11. Qb3 Qd7 12. d4 g5 13. Nf5 Nxe4 14. Ng3 f5 15. Bh5+ Kd8 16. Bg6 f4 17. Bxe4 Ne7 18. Qf7 Qe8 19. Qe6 fxe3 20. fxe3 Rh7 21. dxe5 d5 22. Bxd5 c6 23. Be4 Qf7 24. Qd6+ Kc8 25. Qd4 h5 26. Qd3 h4 27. Bxh7 hxg3 28. hxg3 Bxd3 29. Rh6 Bxh6 30. Bxd3 g4 31. c4 Bxe3 32. Ke2 Qf2+ 33. Kd1 Qxg3 34. Nc2 Bf2 35. Kd2 b5 36. Kc3 c5 37. cxb5 Rxb5 38. Kc4 Rxb2 39. Nb4 axb4 0-1`;

export const overview: GameOverview = {
  title: 'Analisis Game 1: Lukasiud vs ayamlezatkrispi',
  white: 'Lukasiud (299)',
  black: 'ayamlezatkrispi (336)',
  result: '0-1',
  evaluation: "Hitam bermain sabar, membangun pusat yang kuat, dan mengubah keunggulan posisi menjadi kemenangan material melalui tekanan terus-menerus di sayap raja. Kesalahan utama Putih berakar pada koordinasi perwira yang buruk (misal, 13. Nf5) dan blunder fatal di mana Ratu tidak terlindungi pada langkah 28."
};

export const annotations: Record<number, MoveAnalysis> = {
  1: { ply: 1, annotation: "Pembukaan Bidak Raja klasik, bertujuan untuk menguasai pusat." },
  2: { ply: 2, annotation: "Pertahanan Alekhine. Hitam segera menantang bidak e4, memancingnya untuk maju ke e5." },
  3: { ply: 3, annotation: "Langkah pasif yang tidak biasa. Daripada mendorong e5 (langkah utama), Putih memperkuat pusat tetapi memblokir petak perkembangan alami untuk kuda b1.", alternatives: "e5 adalah langkah standar dan yang paling menguji." },
  4: { ply: 4, annotation: "Langkah yang sangat baik. Karena Putih bermain pasif, Hitam segera mengambil alih pusat." },
  5: { ply: 5, annotation: "Memperkuat struktur bidak tetapi tetap sangat pasif." },
  6: { ply: 6, annotation: "Memperkuat e5 dan bersiap untuk mengembangkan sayap menteri." },
  7: { ply: 7, annotation: "Perkembangan normal." },
  8: { ply: 8, annotation: "Bersiap untuk fianchetto gajah petak terang atau bermaksud Ba6." },
  9: { ply: 9, annotation: "Mengembangkan kuda ke pinggir. Biasanya, kuda lebih baik di pusat.", alternatives: "Nd2 adalah langkah perkembangan yang lebih standar." },
  10: { ply: 10, annotation: "Perkembangan pusat yang solid." },
  11: { ply: 11, annotation: "Serangan prematur di sayap. Kuda ini agak salah tempat kecuali didukung." },
  12: { ply: 12, annotation: "Langkah pencegahan fleksibel (profilaksis) untuk mencegah Nf5 dan bersiap untuk fianchetto gajah petak gelap." },
  13: { ply: 13, annotation: "Mengembangkan gajah." },
  14: { ply: 14, annotation: "Mendapatkan ruang di sayap menteri, mungkin mengantisipasi ekspansi sayap menteri Putih." },
  15: { ply: 15, annotation: "Melompat ke pos depan, tetapi mudah diusir." },
  16: { ply: 16, annotation: "Langkah pencegahan, bertahan pada bidak b atau bersiap ...b5." },
  17: { ply: 17, annotation: "Mengembangkan perwira ringan yang tersisa." },
  18: { ply: 18, annotation: "Langsung menantang kuda mengganggu di b5." },
  19: { ply: 19, annotation: "Kuda mundur, membuktikan bahwa manuver ke b5 tidak banyak berguna." },
  20: { ply: 20, annotation: "Profilaksis. Mencegah potensi ide Bg5 atau Ng5 dan bersiap untuk dorongan ...g5 yang agresif." },
  21: { ply: 21, annotation: "Mengaktifkan menteri (ratu), mengincar bidak b6 dan f7." },
  22: { ply: 22, annotation: "Langkah multifungsi. Mempertahankan b7/c6, menghubungkan benteng, dan bersiap mendukung badai bidak sayap raja." },
  23: { ply: 23, annotation: "Akhirnya menantang pusat, tetapi mungkin sudah terlambat karena Hitam terkoordinasi dengan baik." },
  24: { ply: 24, annotation: "Serangan dimulai! Mengusir kuda h4." },
  25: { ply: 25, annotation: "Lompatan putus asa ke lubang di pusat, berharap menciptakan kekacauan.", evaluation: "Kesalahan" },
  26: { ply: 26, annotation: "Taktik brilian! Hitam merebut bidak pusat sementara kuda f5 tampaknya sedang diancam oleh menteri.", evaluation: "Langkah Brilian" },
  27: { ply: 27, annotation: "Mundur kuda untuk menyerang kuda Hitam yang baru saja ke pusat." },
  28: { ply: 28, annotation: "Memperkuat kuda e4 yang kuat dan meluncurkan badai bidak besar-besaran." },
  29: { ply: 29, annotation: "Skak tajam, memaksa raja bergerak." },
  30: { ply: 30, annotation: "Raja melangkah ke d8. Karena pusat relatif tertutup dan Putih kurang koordinasi, raja sangat aman di sini." },
  31: { ply: 31, annotation: "Mencoba menekan f5 dan sayap menteri." },
  32: { ply: 32, annotation: "Dorongan bidak yang menghancurkan! Menggarpu gajah di e3 dan kuda di g3." },
  33: { ply: 33, annotation: "Mengorbankan gajah untuk kuda pusat yang kuat." },
  34: { ply: 34, annotation: "Mereposisi kuda dan secara tidak langsung melindungi bidak f5." },
  35: { ply: 35, annotation: "Menyerang kamp Hitam, tetapi posisi Hitam sangat solid." },
  36: { ply: 36, annotation: "Menawarkan pertukaran ratu. Saat Anda memiliki keunggulan posisi yang besar dan sedang menyerang, menukar ratu dapat menyederhanakan permainan ke akhir game (endgame) yang mudah dimenangkan.", evaluation: "Bagus" },
  37: { ply: 37, annotation: "Putih menolak pertukaran, berharap menjaga komplikasi tetap ada.", evaluation: "Ketidakakuratan" },
  38: { ply: 38, annotation: "Memenangkan perwira! Gajah jatuh." },
  39: { ply: 39, annotation: "Merebut kembali." },
  40: { ply: 40, annotation: "Langkah kreatif multifungsi. Mempersiapkan benteng, melindungi baris ke-7, dan mungkin menyiapkan serangan terbuka terhadap ratu." },
  41: { ply: 41, annotation: "Membuka pusat." },
  42: { ply: 42, annotation: "Bagus sekali! Memblokir pusat, mengamankan petak d5, dan menumpulkan gajah petak terang Putih." },
  43: { ply: 43, annotation: "Pengorbanan putus asa, mencoba merobek posisi." },
  44: { ply: 44, annotation: "Dengan tenang mengusir gajah." },
  45: { ply: 45, annotation: "Mundur." },
  46: { ply: 46, annotation: "Menawarkan pertukaran ratu lagi. Raja Hitam sedikit terbuka, jadi menukar ratu adalah jalan teraman menuju kemenangan mengingat materi ekstra." },
  47: { ply: 47, annotation: "Menskak raja." },
  48: { ply: 48, annotation: "Raja menemukan rumah yang aman dan nyaman di c8." },
  49: { ply: 49, annotation: "Memusatkan menteri." },
  50: { ply: 50, annotation: "Melanjutkan ekspansi sayap raja. Hitam memiliki kendali total." },
  51: { ply: 51, annotation: "Memindahkan menteri, mungkin mengincar benteng h7." },
  52: { ply: 52, annotation: "Dorongan terakhir! Menyerang kuda dan membuka lajur h." },
  53: { ply: 53, annotation: "Putih mengambil benteng di h7, tidak menyadari ancaman yang lebih besar.", evaluation: "Kesalahan" },
  54: { ply: 54, annotation: "Hitam mengabaikan hilangnya benteng dan mengambil kuda, menghancurkan perlindungan raja Putih.", evaluation: "Langkah Terbaik" },
  55: { ply: 55, annotation: "Merebut kembali." },
  56: { ply: 56, annotation: "Blunder fatal dari Putih! Menteri di d3 tidak terjaga sepanjang waktu! Hitam dengan senang hati mengambilnya.", evaluation: "Blunder" },
  57: { ply: 57, annotation: "Mencoba menyelamatkan sesuatu, menyerang h6." },
  58: { ply: 58, annotation: "Hitam mengambil benteng yang aktif. Ini adalah pembantaian total sekarang." },
  59: { ply: 59, annotation: "Putih mengambil kembali gajah." },
  60: { ply: 60, annotation: "Mendorong bidak bebas (passed pawn)." },
  61: { ply: 61, annotation: "Dorongan bidak yang putus asa." },
  62: { ply: 62, annotation: "Hitam mengambil lebih banyak bidak." },
  63: { ply: 63, annotation: "Raja mencoba menyingkir." },
  64: { ply: 64, annotation: "Skak yang menghancurkan, memulai jaring mat." },
  65: { ply: 65, annotation: "Paksaan." },
  66: { ply: 66, annotation: "Membersihkan semua sisa bidak." },
  67: { ply: 67, annotation: "Mengembangkan kuda yang terlupakan." },
  68: { ply: 68, annotation: "Dominasi penuh." },
  69: { ply: 69, annotation: "Raja mengembara." },
  70: { ply: 70, annotation: "Membuka sedikit pelindung sayap menteri yang tersisa." },
  71: { ply: 71, annotation: "Maju." },
  72: { ply: 72, annotation: "Membatasi raja." },
  73: { ply: 73, annotation: "Mengambil." },
  74: { ply: 74, annotation: "Benteng bergabung dalam perburuan." },
  75: { ply: 75, annotation: "Menyerang benteng." },
  76: { ply: 76, annotation: "Mengambil lebih banyak materi. Posisi Putih sama sekali tidak ada harapan." },
  77: { ply: 77, annotation: "Blokade putus asa." },
  78: { ply: 78, annotation: "Hitam mengambil kuda, dan Putih menyerah. Contoh yang sangat sempurna dalam memanfaatkan koordinasi yang buruk." },
};

