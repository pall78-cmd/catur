import React, { useState } from 'react';
import { FileText, Check, Copy, Download, Database } from 'lucide-react';
import { savePgnToLibrary } from '../../utils/pgnStorage';

interface PgnExportCardProps {
  overviewText: string;
  fullPgnText: string;
  onOpenLibrary?: () => void;
}

export const PgnExportCard: React.FC<PgnExportCardProps> = React.memo(({
  overviewText,
  fullPgnText,
  onOpenLibrary,
}) => {
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [showRawPgn, setShowRawPgn] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(fullPgnText);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleDownloadPgn = () => {
    const blob = new Blob([fullPgnText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis_catur_${new Date().toISOString().slice(0, 10)}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleQuickSaveToDb = async () => {
    try {
      await savePgnToLibrary('', fullPgnText);
      setSaveStatus('Tersimpan di IndexedDB!');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('Gagal menyimpan');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-neutral-200/90 p-3 sm:p-3.5 flex flex-col gap-2.5">
      <div>
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 border-b border-neutral-100 pb-1.5">
          Ringkasan Game
        </h2>
        <p className="text-neutral-700 leading-relaxed text-xs">
          {overviewText}
        </p>
      </div>

      <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-700" />
            <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider">
              Ekspor Game (PGN)
            </h3>
          </div>
          <button
            onClick={() => setShowRawPgn(!showRawPgn)}
            className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
          >
            {showRawPgn ? 'Sembunyikan PGN' : 'Pratinjau PGN'}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyPgn}
            className="flex-1 min-w-[110px] py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Salin string PGN ke clipboard"
          >
            {copiedPgn ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks PGN</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPgn}
            className="flex-1 min-w-[110px] py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-neutral-200/90 cursor-pointer"
            title="Unduh file .pgn ke perangkat Anda"
          >
            <Download className="w-3.5 h-3.5 text-neutral-700" />
            <span>Unduh File .PGN</span>
          </button>
          <button
            onClick={handleQuickSaveToDb}
            className="flex-1 min-w-[120px] py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/90 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Simpan game ini ke koleksi IndexedDB lokal browser"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>{saveStatus || 'Simpan ke IndexedDB'}</span>
          </button>
        </div>

        {onOpenLibrary && (
          <button
            onClick={onOpenLibrary}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors text-right underline cursor-pointer self-end"
          >
            Kelola Koleksi PGN IndexedDB &rarr;
          </button>
        )}

        {showRawPgn && (
          <div className="mt-1 p-2.5 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap border border-neutral-800 leading-relaxed">
            {fullPgnText}
          </div>
        )}
      </div>
    </div>
  );
});

PgnExportCard.displayName = 'PgnExportCard';
