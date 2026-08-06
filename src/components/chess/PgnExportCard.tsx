import React, { useState } from 'react';
import { FileText, Check, Copy, Download } from 'lucide-react';

interface PgnExportCardProps {
  overviewText: string;
  fullPgnText: string;
}

export const PgnExportCard: React.FC<PgnExportCardProps> = React.memo(({
  overviewText,
  fullPgnText,
}) => {
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [showRawPgn, setShowRawPgn] = useState(false);

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 flex flex-col gap-3">
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPgn}
            className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            {copiedPgn ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>PGN Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin PGN</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPgn}
            className="flex-1 py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .PGN</span>
          </button>
        </div>

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
