# Changelog

Semua perubahan pada proyek ini akan dicatat di dalam berkas ini.

## [2.0.0] - 2026-08-07
### Major Release & UI Refinement
- **Pembaruan Desain Kontrol Putar (Compact Control Layout):** Penataan ulang dan rekonstruksi total pada komponen tombol navigasi permainan (`ChessControls`). Seluruh tombol (`Awal`, `Sebelumnya`, `Putar/Jeda`, `Selanjutnya`, `Akhir`) kini digabungkan secara rapi dalam satu kapsul terpadu (*Unified Control Cluster*) sehingga tidak ada tombol yang melenceng, terdorong, atau keluar dari batas kotak UI.
- **Pencegahan Tumpang Tindih & Z-Index Clean Code:** Menghapus z-index kaku dan tumpang tindih layout. Memastikan tata letak elemen visual berjalan secara proporsional dan fleksibel (*zero z-index collision*) di berbagai resolusi layar (Mobile, Tablet, Desktop).
- **Integrasi Informasi Mesin Stockfish Ringkas:** Menyatukan indikator performa Stockfish 18 (kedalaman kalkulasi, alokasi memori 32MB) ke dalam footer status ringkas di kartu langkah aktif (`ActiveMoveCard`) untuk menyederhanakan ruang tampilan tanpa mengurangi fungsionalitas.
- **Pembersihan Bug & Optimasi Besar Sistem:** Memperbaiki bug evaluasi promosi bidak, menyelaraskan sinkronisasi status papan, dan melakukan optimasi menyeluruh pada struktur kode TypeScript agar aplikasi berjalan sangat ringan, cepat, dan stabil.

## [1.10.0] - 2026-08-07
### Added
- **Pemisahan Statistik Kualitas Langkah (Bidak Putih vs Bidak Hitam):** Statistik kualitas langkah (Brilian, Terbaik, Bagus, Teori, Inakurasi, Kesalahan, Blunder, Paksaan, Terlewat) kini dipisah secara eksplisit antara Bidak Putih dan Bidak Hitam. Dilengkapi dengan tampilan *Side-by-Side Comparison* dan filter tab (`Bandingkan`, `Putih`, `Hitam`, `Total`) untuk pemilahan dan kemudahan analisis performa tiap pemain.
- **Pengaturan & Kelonggaran Laju Putar Analisis (Playback Speed Selector):** Menambah kelonggaran laju putar otomatis analisis dari 1.8 detik menjadi 2.8 detik secara default agar pengguna dapat melihat langkah per langkah dengan santai dan nyaman. Menyediakan dropdown pemilih kecepatan putar (`Santai 3.8s`, `Normal 2.8s`, `Cepat 1.8s`, `Sangat Cepat 1s`).

### Fixed
- **Perbaikan Evaluasi Promosi Bidak (Pawn Promotion Fix):** Memperbaiki bug kritis di mana langkah promosi bidak (seperti `e8=Q` atau `a8=N`) dibaca secara salah sebagai "Remis" karena kehadiran karakter `=`. Evaluasi remis kini didasarkan secara presisi pada pemeriksaan status papan catur nyata (`isDraw()`, `isStalemate()`, repetition, material).
- **Optimasi & Refactoring Sistem:** Melakukan pembersihan basis kode, perapian tipe data, penanganan exception, dan stabilisasi performa jangka panjang agar sistem terjaga dan mudah dikembangkan.

## [1.9.0] - 2026-08-06
### Added
- **Komentar Taktis Alami (Fluid Tactical Commentary):** Menghapus format lama berupa header kaku ("Analisis Objektif" & "Analisis Subjektif") yang terpisah. Komentar langkah kini disajikan dalam satu narasi mengalir yang natural, menyatu dengan kalkulasi deviasi persentase peluang kemenangan dari Stockfish jika ada penurunan akurasi.
- **Rekomendasi Jalur Terbaik:** Menampilkan kelanjutan variasi atau langkah alternatif terbaik yang disarankan oleh mesin Stockfish langsung di dalam komentar langkah taktis.

### Fixed
- **Deteksi Akurat Pembukaan (Opening) & Variasi:** Memperbaiki bug yang menyebabkan pembukaan tidak terdeteksi atau tidak sesuai dengan jalannya permainan. Sistem kini melakukan normalisasi string langkah catur (membersihkan simbol anotasi seperti `+`, `#`, `?`, `!`, `?!`) sebelum mencocokkannya dengan database pembukaan (`detectOpening` & `findOpening`).
- **Sinkronisasi Sempurna Statistik & Anotasi:** Menyelaraskan pelacakan riwayat permainan dengan tabel daftar langkah (Move Table), menjamin nama pembukaan, variasi, evaluasi langkah, dan detail anotasi yang ditampilkan selalu 100% sinkron dan sesuai dengan progres langkah aktif di papan catur.
- **Perapian Basis Kode (Code Refactoring):** Merapikan import, membersihkan penanganan state pada hook evaluasi, dan memangkas redundansi kode untuk performa eksekusi yang optimal dan bebas bug.

## [1.8.0] - 2026-08-05
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
