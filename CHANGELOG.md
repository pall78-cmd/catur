# Changelog

Semua perubahan pada proyek ini akan dicatat di dalam berkas ini.

## [Unreleased]
### Added
- Fitur **Papan Catur Interaktif** dengan evaluasi Stockfish 18 (WASM) untuk analisis langsung di peramban (browser).
- **Mode Posisi Kustom (FEN):** Memungkinkan pengguna untuk memasukkan teks (string) FEN dan menganalisis posisi khusus menggunakan mesin Stockfish, lengkap dengan garis panah yang menunjukkan rekomendasi langkah terbaik.
- **Tanda Evaluasi Catur:** Tanda evaluasi visual seperti Panah (Arrows) dan Simbol Notasi (?, !!, !, ?!, dll.) langsung di atas Daftar Langkah dan di Papan Catur untuk menyoroti blunder, langkah brilian, dan kesalahan.
- **Antarmuka (UI) Berbahasa Indonesia:** Seluruh antarmuka telah diterjemahkan ke dalam Bahasa Indonesia dengan rapi (Daftar Langkah, Evaluasi, Kontrol, dan Anotasi) sesuai dengan permintaan untuk menjamin kemudahan akses bagi pengguna lokal.
- **Saran Strategis Dinamis:** Menambahkan analisis mesin mendalam (Saran Strategis) untuk posisi Kustom maupun Terpandu yang menjelaskan langkah improvisasi, prioritas saat pembukaan (opening), pertengahan (midgame), dan akhir (endgame), serta peringatan pencegahan blunder saat evaluasi Stockfish sangat buruk.

### Changed
- **Saran Strategis Dinamis & Anotasi Otomatis PGN:** Sistem penulisan anotasi kini didukung oleh mesin anotasi taktis dinamis Bahasa Indonesia. Setiap langkah dari PGN atau FEN kustom (Lichess/Chess.com) sekarang memiliki narasi taktis yang akurat (memakan perwira, rokade, skak, promosi, pengembangan perwira, analisis pertengahan/akhir) serta klasifikasi evaluasi Stockfish (Brilian, Terbaik, Bagus, Ketidakakuratan, Kesalahan, Blunder) secara otomatis.
- **Pembaruan Tata Letak (Layout):** Penjelasan langkah demi langkah, anotasi PGN, dan evaluasi Stockfish (real-time) diletakkan dengan sangat rapi. Tombol kontrol navigasi/putar kini disederhanakan dan disatukan secara kompak langsung di bawah papan catur beserta slider langkah, sementara panel input FEN/PGN dipindahkan ke bagian bawah agar antarmuka tidak terasa ramai dan mengganggu tampilan utama.
- **Penghapusan Gulir Otomatis:** Fitur gulir otomatis (auto-scroll) pada bagian Daftar Langkah (Move List) telah dihentikan (dinonaktifkan) sesuai dengan umpan balik, memberi pengguna kontrol penuh atas daftar langkah.

### Fixed
- **Perbaikan Animasi Papan Catur:** Menangani masalah "Square width not found" pada pustaka `react-chessboard` v5 dengan menonaktifkan perpindahan animasi sepotong instan (`showAnimations: false`) untuk mencegah kesalahan kalkulasi DOM saat mengubah posisi papan atau navigasi langkah.
- **Deteksi Header PGN Dinamis:** Nama pemain (Pemain Putih / Pemain Hitam), judul turnamen, dan hasil pertandingan dari string PGN yang dimasukkan sekarang secara otomatis terdeteksi dan diperbarui di papan catur.
- Pencegahan konflik tata letak di antara mode Kustom dan mode Terpandu (Guided) dengan penanganan memori FEN yang hati-hati.

---

*(Log pembaruan disusun dengan rapi untuk menjamin basecode tidak acak-acakan).*
