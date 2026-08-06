import React from 'react';
import { BookOpen } from 'lucide-react';

interface ChessHeaderProps {
  title: string;
  detectedOpening: string | null;
}

export const ChessHeader: React.FC<ChessHeaderProps> = React.memo(({ title, detectedOpening }) => {
  return (
    <header className="mb-6 text-center">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-2 font-serif">
        {title}
      </h1>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <p className="text-neutral-500 text-xs md:text-sm font-medium uppercase tracking-wider">
          Interactive POV Analysis
        </p>
        {detectedOpening && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            {detectedOpening}
          </span>
        )}
      </div>
    </header>
  );
});

ChessHeader.displayName = 'ChessHeader';
