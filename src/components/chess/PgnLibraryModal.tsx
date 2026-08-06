import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Trash2, Play, Search, Save, Plus, Database, Upload, CheckCircle2 } from 'lucide-react';
import { SavedPgnGame, getAllSavedPgns, deleteSavedPgn, savePgnToLibrary } from '../../utils/pgnStorage';

interface PgnLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPgn: (pgn: string) => void;
  currentPgnText?: string;
}

export const PgnLibraryModal: React.FC<PgnLibraryModalProps> = React.memo(({
  isOpen,
  onClose,
  onSelectPgn,
  currentPgnText,
}) => {
  const [savedPgns, setSavedPgns] = useState<SavedPgnGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load PGN list from IndexedDB when opened
  const refreshList = async () => {
    setIsLoading(true);
    const list = await getAllSavedPgns();
    setSavedPgns(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = async () => {
    if (!currentPgnText) return;
    try {
      await savePgnToLibrary(customTitle, currentPgnText);
      setCustomTitle('');
      setSaveStatus('Game berhasil disimpan ke IndexedDB!');
      setTimeout(() => setSaveStatus(null), 3000);
      await refreshList();
    } catch (err) {
      console.error(err);
      setSaveStatus('Gagal menyimpan game.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus game ini dari koleksi IndexedDB tersimpan?')) {
      await deleteSavedPgn(id);
      await refreshList();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      await savePgnToLibrary(fileNameWithoutExt, text);
    }
    setSaveStatus(`Berhasil mengimpor ${files.length} file PGN ke IndexedDB!`);
    setTimeout(() => setSaveStatus(null), 3000);
    await refreshList();
  };

  const filteredPgns = savedPgns.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.white && item.white.toLowerCase().includes(q)) ||
      (item.black && item.black.toLowerCase().includes(q)) ||
      (item.event && item.event.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Koleksi PGN Tersimpan (IndexedDB)</h2>
              <p className="text-[11px] text-neutral-400">Penyimpanan lokal browser tanpa membebankan performa aplikasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 flex-1">
          {/* Action Row: Save Current Game & File Upload */}
          <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" /> Simpan Game Aktif Ke Library
            </h3>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Judul game (Opsional, cth: Game Latihan 1)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                onClick={handleSaveCurrent}
                disabled={!currentPgnText}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>

              <label className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span>Impor File .PGN</span>
                <input
                  type="file"
                  accept=".pgn"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {saveStatus && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{saveStatus}</span>
              </div>
            )}
          </div>

          {/* Search bar & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul, nama pemain, atau turnamen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-700"
              />
            </div>
            <span className="text-[11px] text-neutral-500 font-mono font-medium px-2 shrink-0">
              Total: {filteredPgns.length} Game
            </span>
          </div>

          {/* Game List */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-neutral-400">Memuat koleksi IndexedDB...</div>
          ) : filteredPgns.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-neutral-200 rounded-xl p-6">
              <FolderOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-600">Belum ada PGN tersimpan di IndexedDB</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto">
                Anda dapat menyimpan PGN yang sedang dianalisis di atas atau mengimpor file .pgn dari komputer Anda.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredPgns.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectPgn(item.pgn);
                    onClose();
                  }}
                  className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs hover:border-indigo-300"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.result && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded font-semibold border border-neutral-200">
                          {item.result}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {item.white && item.black ? (
                        <span><strong className="text-neutral-700">{item.white}</strong> vs <strong className="text-neutral-700">{item.black}</strong></span>
                      ) : (
                        <span>Pratinjau PGN: {item.pgn.slice(0, 60)}...</span>
                      )}
                      {item.event && <span className="ml-2 text-neutral-400">• {item.event}</span>}
                    </p>
                    <span className="text-[9px] text-neutral-400 mt-1 block">
                      Disimpan pada: {new Date(item.savedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPgn(item.pgn);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-indigo-200 cursor-pointer"
                      title="Muat game ini ke Papan Analisis"
                    >
                      <Play className="w-3 h-3 fill-indigo-600" />
                      <span>Muat</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus dari IndexedDB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Storage: IndexedDB Browser Storage (Kapasitas &gt; 1GB)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
});

PgnLibraryModal.displayName = 'PgnLibraryModal';
