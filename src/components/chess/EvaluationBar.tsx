import React, { useMemo } from 'react';
import { getPositionEvalSymbol } from '../../utils/chessAnnotations';

interface EvaluationBarProps {
  evaluation: string;
  boardOrientation: 'white' | 'black';
}

/**
 * Calculates White's height percentage on the evaluation bar based on Stockfish evaluation string.
 * Uses a smooth logistic (sigmoid) curve for centipawns and 100%/0% for mate scores.
 */
function getWhiteAdvantagePercent(evaluation: string): number {
  if (!evaluation || evaluation === 'Mengevaluasi...' || evaluation.includes('Gagal')) {
    return 50; // Neutral balance
  }

  // Handle mate evaluations e.g. "+M3", "-M1", "M2"
  if (evaluation.includes('M')) {
    if (evaluation.startsWith('-')) {
      return 0; // Black wins
    }
    return 100; // White wins
  }

  // Parse numeric pawn advantage e.g. "+1.5", "-0.8", "0.0"
  const numericVal = parseFloat(evaluation);
  if (isNaN(numericVal)) {
    return 50;
  }

  // Sigmoid formula for smooth non-linear pawn value scaling
  const k = 0.35;
  const sig = 1 / (1 + Math.exp(-k * numericVal));
  const rawPct = sig * 100;

  // Clamp within 3% to 97% for non-mate scores so a thin bar remains visible for both sides
  return Math.min(97, Math.max(3, rawPct));
}

export const EvaluationBar: React.FC<EvaluationBarProps> = React.memo(({
  evaluation,
  boardOrientation,
}) => {
  const whitePercent = useMemo(() => getWhiteAdvantagePercent(evaluation), [evaluation]);

  // Orientation toggle:
  // 'white' orientation -> Top = Black (dark), Bottom = White (light)
  // 'black' orientation -> Top = White (light), Bottom = Black (dark)
  const isFlipped = boardOrientation === 'black';

  // Calculate top bar height percentage
  const topBarHeight = isFlipped ? whitePercent : 100 - whitePercent;

  // Formatted display text (e.g., "+1.5", "-0.8", "+M3")
  const displayText = useMemo(() => {
    if (!evaluation || evaluation === 'Mengevaluasi...' || evaluation.includes('Gagal')) {
      return '0.0';
    }
    return evaluation;
  }, [evaluation]);

  // Determine whether White or Black is leading for text placement & contrast
  const isWhiteLeading = whitePercent >= 50;

  return (
    <div
      className="w-3.5 sm:w-4.5 rounded-md overflow-hidden bg-neutral-900 border border-neutral-300/80 shadow-xs flex flex-col justify-between relative select-none shrink-0 transition-all duration-300"
      title={`Evaluasi Posisi: ${displayText} ${getPositionEvalSymbol(displayText)}`}
    >
      {/* Top Section */}
      <div
        className={`w-full transition-all duration-500 ease-out ${
          isFlipped ? 'bg-neutral-100' : 'bg-neutral-800'
        }`}
        style={{ height: `${topBarHeight}%` }}
      />

      {/* Bottom Section */}
      <div
        className={`w-full transition-all duration-500 ease-out flex-1 ${
          isFlipped ? 'bg-neutral-800' : 'bg-neutral-100'
        }`}
      />

      {/* Text Overlay Indicator */}
      <div
        className={`absolute w-full text-center left-0 px-0.5 pointer-events-none transition-all duration-300 ${
          (isWhiteLeading && !isFlipped) || (!isWhiteLeading && isFlipped)
            ? 'bottom-1 text-neutral-900 font-extrabold'
            : 'top-1 text-neutral-100 font-extrabold'
        }`}
        style={{ fontSize: '9px', lineHeight: '10px' }}
      >
        <span className="font-mono tracking-tighter block truncate">
          {displayText}
        </span>
      </div>
    </div>
  );
});

EvaluationBar.displayName = 'EvaluationBar';
