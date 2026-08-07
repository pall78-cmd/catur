import React from 'react';
import { History, X, CheckCircle2, Sparkles, Code2 } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANGELOG_DATA = [
  {
    version: 'v2.0.0',
    date: 'Major Release (v2.0.0)',
    tag: 'UI Compact, Refinement & Optimasi Performa',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    changes: [
      {
        title: 'Pembaruan Desain Kontrol Navigasi (Compact Play Controls)',
        desc: 'Merekonstruksi tata letak tombol kontrol navigasi (Awal, Sebelumnya, Putar/Jeda, Selanjutnya, Akhir) ke dalam satu kapsul terpadu (Unified Control Cluster). Memastikan seluruh tombol dan dropdown kecepatan tersusun rapi tanpa risiko melenceng atau keluar dari batas container.',
      },
      {
        title: 'Pencegahan Tumpang Tindih & Layout Tanpa Bentrok Z-Index',
        desc: 'Merapikan hirarki visual dan menghapus z-index kaku. Memastikan interaksi tombol, modal, dan elemen papan catur berjalan bersih dan responsif di seluruh ukuran layar.',
      },
      {
        title: 'Integrasi Indikator Mesin Stockfish Ringkas',
        desc: 'Menyatukan status aktif Stockfish 18 dan indikator kedalaman kalkulasi langsung pada footer kartu langkah aktif untuk tampilan yang lebih bersih, hemat ruang, dan efisien.',
      },
      {
        title: 'Pembersihan Bug & Optimasi Sistem Skala Besar',
        desc: 'Memperbaiki bug evaluasi promosi bidak (Pawn Promotion), menyelaraskan sinkronisasi status papan, serta merapikan struktur kode TypeScript agar responsif dan bebas hambatan.',
      },
    ],
  },
  {
    version: 'v1.10.0',
    date: 'Rilis Sebelumnya (v1.10.0)',
    tag: 'Pemisahan Statistik Bidak & Perbaikan Promosi',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    changes: [
      {
        title: 'Perbaikan Evaluasi Promosi Bidak (Pawn Promotion)',
        desc: 'Memperbaiki bug di mana langkah promosi bidak (misal e8=Q) dibaca secara salah sebagai "Remis" karena deteksi simbol "=". Evaluasi remis kini didasarkan secara presisi pada pemeriksaan status papan catur nyata (stalemate, 3-fold repetition, material).',
      },
      {
        title: 'Pemisahan Statistik Kualitas Langkah (Putih vs Hitam)',
        desc: 'Statistik kualitas langkah (Brilian, Terbaik, Bagus, Teori, Inakurasi, Kesalahan, Blunder, Paksaan, Terlewat) kini dipisah secara mandiri antara Bidak Putih dan Bidak Hitam dengan mode Side-by-Side Comparison dan filter tab.',
      },
      {
        title: 'Pengaturan & Kelonggaran Laju Putar Analisis',
        desc: 'Laju otomatis putar langkah dinaikkan menjadi 2.8 detik secara default agar nyaman dinikmati langkah demi langkah, dilengkapi dropdown pemilih kecepatan (Santai 3.8s, Normal 2.8s, Cepat 1.8s, Sangat Cepat 1s).',
      },
      {
        title: 'Perapian & Optimasi Basis Kode Jangka Panjang',
        desc: 'Merapi dan menstrukturkan ulang sourcecode, memperkuat penanganan tipe TypeScript, serta memangkas potensi error pada evaluasi analisis catur.',
      },
    ],
  },
  {
    version: 'v1.9.0',
    date: 'Rilis Sebelumnya (v1.9.0)',
    tag: 'Akurasi Deteksi Opening & Komentar Taktis Alami',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    changes: [
      {
        title: 'Komentar Taktis Alami (Fluid Tactical Commentary)',
        desc: 'Menghapus pemisahan kaku "Analisis Objektif" & "Analisis Subjektif". Komentar langkah kini disajikan dalam satu narasi yang mengalir natural, terintegrasi langsung dengan kalkulasi penurunan persentase kemenangan dari Stockfish (loss) serta saran jalur terbaik mesin.',
      },
      {
        title: 'Deteksi Akurat Pembukaan (Opening) & Variasi',
        desc: 'Memperbaiki bug di mana pembukaan atau variasi catur tidak terbaca atau tidak sesuai dengan jalannya permainan. Sistem kini secara otomatis menormalisasi simbol anotasi langkah (+, #, ?, !, ?!) sebelum memvalidasi ke database teori pembukaan.',
      },
      {
        title: 'Sinkronisasi Sempurna Statistik & Anotasi',
        desc: 'Menyelaraskan pelacakan riwayat permainan aktif dengan Move Table, memastikan nama pembukaan, klasifikasi langkah, dan detail anotasi yang ditampilkan selalu 100% sinkron dan sesuai dengan langkah aktif di papan catur.',
      },
      {
        title: 'Perapian & Optimasi Basis Kode',
        desc: 'Merapikan import, mengoptimalkan memoization React untuk rendering komponen papan catur yang lebih responsif, serta membersihkan sisa-sisa kode pengujian agar aplikasi super stabil.',
      },
    ],
  },
  {
    version: 'v1.8.0',
    date: 'Pembaruan Terbaru',
    tag: 'Widget Performa SF18 & Klasifikasi Langkah Otomatis',
    tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    changes: [
      {
        title: 'Widget Dashboard Monitoring Memori & Depth Stockfish 18',
        desc: 'Menampilkan indikator real-time alokasi memori Hash Table Stockfish 18 (32 MB), kedalaman kalkulasi pencarian (Target D18), latency eksekusi (ms), dan alokasi memori JS Heap browser.',
      },
      {
        title: 'Perbaikan Total Mode Permainan Manual & Drag-and-Drop',
        desc: 'Memperbaiki bug interaksi drag-and-drop pada papan catur sehingga pengguna kini dapat dengan lancar memainkan langkah manual kustom untuk mencoba strategi dan variasi baru.',
      },
      {
        title: 'Sistem Klasifikasi & Label Langkah Otomatis Lengkap',
        desc: 'Sistem secara cerdas memberi label pada setiap langkah: Blunder (??), Kesalahan (?), Ketidakakuratan (?!), Langkah Terlewat (🛟), Langkah Paksaan (!), Brilian (!!), Teori (📖), Bagus (✓), Terbaik (★), Skak (⚔️), Skakmat (👑), dan Remis (🤝).',
      },
      {
        title: 'Arsitektur & Kode Sumber Terstruktur Rapi',
        desc: 'Pembersihan modul secara terisolasi, penanganan event handlers yang kuat, dan manajemen state yang bersih untuk memastikan tidak ada bug atau regresi.',
      },
    ],
  },
  {
    version: 'v1.7.0',
    date: 'Versi v1.7.0',
    tag: 'Pembaruan Mesin Stockfish 18 & Analisis Kedalaman D18',
    tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    changes: [
      {
        title: 'Upgrade Mesin Catur ke Stockfish 18 (SF18)',
        desc: 'Mesin evaluasi catur kini menggunakan runtime Stockfish 18 berkecepatan tinggi dengan kalkulasi kedalaman default D18 untuk penilaian taktikal dan posisional yang jauh lebih tajam dan akurat.',
      },
      {
        title: 'Optimasi Cache Evaluasi Per Langkah (Per-Move Eval Mapping)',
        desc: 'Sistem pencatatan evaluasi mengingat skor dan saran perwira Stockfish 18 untuk setiap langkah PGN secara independen tanpa mengalami kebingungan FEN.',
      },
      {
        title: 'Lencana Indikator SF18 Real-time',
        desc: 'Kartu analisis kini menampilkan status engine SF18 • D18 secara transparan untuk menunjukkan progres kedalaman analisis yang aktif.',
      },
    ],
  },
  {
    version: 'v1.6.0',
    date: 'Versi v1.6.0',
    tag: 'Sorotan Petak & Deteksi Variasi Kustom',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    changes: [
      {
        title: 'Sorotan Petak Langkah (Board Square Highlighting)',
        desc: 'Sistem menandai petak asal (source) dan petak tujuan (target) dari langkah terakhir maupun variasi percobaan secara visual dengan warna keemasan beranimasi halus, meningkatkan kejelasan visualisasi permainan.',
      },
      {
        title: 'Klasifikasi & Evaluasi Variasi Kustom Real-time',
        desc: 'Variasi percobaan user (trial moves) kini langsung dianalisis oleh sistem untuk mendeteksi kualitas langkah: Blunder (??), Kesalahan (?), Ketidakakuratan (?!), Bagus (✓), Terbaik (★), Brilian (!!), Teori (📖), atau Langkah Paksaan (!).',
      },
      {
        title: 'Manajemen Variasi & Tombol Hapus Variasi Intuitif',
        desc: 'Menambahkan kontrol cepat untuk menghapus variasi percobaan dan kembali ke jalur permainan utama tanpa risiko tumpang tindih state atau bug navigasi.',
      },
      {
        title: 'Pencegahan Konflik Z-Index & Animasi Ringan',
        desc: 'Pengaturan lapisan overlay lencana evaluasi dan papan catur yang dioptimalkan agar tidak mengalami bentrokan rendering, memastikan transisi 60 FPS di seluruh siklus pembukaan hingga babak akhir (endgame).',
      },
    ],
  },
  {
    version: 'v1.5.0',
    date: 'Evaluasi Bar',
    tag: 'Visual Evaluation Bar',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-200',
    changes: [
      {
        title: 'Bar Evaluasi Posisi Visual (Evaluation Bar)',
        desc: 'Bilah indikator evaluasi interaktif yang ditempatkan persis di samping papan catur, memperlihatkan keunggulan Putih/Hitam secara real-time (+0.0, +2.5, -1.8, #M3) menggunakan kalkulasi kurva sigmoid presisi.',
      },
      {
        title: 'Adaptasi Rotasi Papan Catur Flipped',
        desc: 'Bar evaluasi secara otomatis membalik warna baris atas/bawah ketika orientasi papan diubah (Flip Board / Rotasi F), memastikan visualisasi keuntungan selaras dengan pemain di bagian atas/bawah.',
      },
      {
        title: 'Optimasi Respon & Pencegahan Lag WebWorker',
        desc: 'Penerapan pencabutan timer debounce otomatis saat pembersihan efek (cleanup useEffect) dan pembatasan pembaruan state DOM untuk performa animasi 60 FPS tanpa kebocoran memori.',
      },
      {
        title: 'Pemeriksaan Tipe Data & Kompatibilitas FEN/PGN',
        desc: 'Penanganan pencegahan error parsing pada FEN ilegal, status skakmat ekstrem (+M/-M), dan validasi komponen terisolasi agar aman untuk pemeliharaan jangka panjang.',
      },
    ],
  },
  {
    version: 'v1.4.0',
    date: 'Stockfish Depth 15 & Clean Code',
    tag: 'Engine Upgrade',
    tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    changes: [
      {
        title: 'Peningkatan Kedalaman Mesin (Depth 15)',
        desc: 'Core Stockfish ditingkatkan dari Depth 12 ke Depth 15, memberikan perhitungan taktis dan evaluasi positional yang jauh lebih akurat.',
      },
      {
        title: 'Optimasi Memori UCI & Debounce Search',
        desc: 'Menerapkan opsi Hash 32MB untuk memori posisi transposisi serta debounce request 30ms agar pengoperasian tombol dan navigasi tidak memicu lag pada WebWorker.',
      },
      {
        title: 'Arsitektur & Dokumentasi JSDoc Profesional',
        desc: 'Pembersihan basis kode hook dan komponen dengan tipe data TypeScript eksplisit, dokumentasi JSDoc terstruktur, serta penanganan siklus hidup komponen yang mudah dipelihara oleh pengembang senior.',
      },
      {
        title: 'Indikator Kedalaman Real-time (SF • D15)',
        desc: 'Lencana evaluasi mesin di kartu analisis kini menampilkan tingkat kedalaman (Depth) kalkulasi Stockfish secara langsung.',
      },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'UI & Ergonomi',
    tag: 'UI & Responsive Optimization',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    changes: [
      {
        title: 'Responsivitas Papan Catur Dinamis',
        desc: 'Papan catur kini mempertahankan rasio aspek 1:1 (aspect-square) presisi dan menyesuaikan ukuran secara otomatis berdasarkan lebar kontainer di perangkat mobile maupun desktop.',
      },
      {
        title: 'Ergonomi Tata Letak Kontrol',
        desc: 'Tombol navigasi & playback (Putar/Jeda, Langkah Selanjutnya/Sebelumnya) ditempatkan langsung di bawah kartu Analisis Langkah untuk kemudahan akses pengguna.',
      },
      {
        title: 'Eksplorasi Tanpa Auto-Scroll Paksa',
        desc: 'Menghentikan pengguliran otomatis layar saat menekan tombol Play, Next, atau Redo agar fokus membaca analisis tidak terganggu.',
      },
      {
        title: 'Komposisi Kartu Analisis Ringkas',
        desc: 'Desain ulang kartu analisis langkah menjadi lebih compact, elegan, dan kaya informasi tanpa memakan banyak ruang vertikal.',
      },
      {
        title: 'Preset Game Cepat',
        desc: 'Menambahkan pilihan game bersejarah (Kasparov vs Topalov 1999 & Opera Game Morphy 1858) untuk analisis instan.',
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'Fitur Engine & Audio',
    tag: 'Stockfish Integration',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    changes: [
      {
        title: 'Evaluasi Mesin Stockfish',
        desc: 'Kalkulasi angka evaluasi posisi real-time, saran langkah terbaik, serta perhitungan persentase akurasi pemain.',
      },
      {
        title: 'Efek Suara Catur Realistis',
        desc: 'Suara sintetis web audio untuk pergerakan bidak, penangkapan (capture), skak (+), skakmat (#), dan rokade (O-O).',
      },
      {
        title: 'Pengolah FEN & PGN',
        desc: 'Kemampuan memuat format FEN/PGN kustom serta ekspor laporan game lengkap dalam format .PGN.',
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'Simulasi & Arsitektur Moduler',
    tag: 'Core Feature',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    changes: [
      {
        title: 'Modul Trial Variasi Langkah',
        desc: 'Fitur drag-and-drop / click-to-move di papan untuk mencoba variasi langkah hipotetis tanpa merusak alur game utama.',
      },
      {
        title: 'Refaktorisasi Kode Clean Architecture',
        desc: 'Pemisahan komponen secara terstruktur, penanganan TypeScript ketat tanpa error lint, dan optimasi memoisasi React.',
      },
    ],
  },
];

export const ChangelogModal: React.FC<ChangelogModalProps> = React.memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-neutral-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-900 text-white rounded-xl">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                Catatan Perubahan (Changelog & Patchnotes)
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                Riwayat pembaruan, optimasi UI, dan fitur aplikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-6 text-xs divide-y divide-neutral-100">
          {CHANGELOG_DATA.map((release) => (
            <div key={release.version} className="pt-4 first:pt-0 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-neutral-900 font-mono">
                    {release.version}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${release.tagColor}`}>
                    {release.tag}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  {release.date}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {release.changes.map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50/70 rounded-xl border border-neutral-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-neutral-800 text-xs">
                        {item.title}
                      </span>
                      <p className="text-neutral-600 leading-relaxed text-[11px]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
          <span className="flex items-center gap-1 font-mono">
            <Code2 className="w-3.5 h-3.5 text-neutral-400" /> Source Code: Clean TypeScript
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
});

ChangelogModal.displayName = 'ChangelogModal';
