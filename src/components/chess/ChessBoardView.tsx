import React from 'react';
import { Chessboard } from 'react-chessboard';
import { RotateCcw } from 'lucide-react';
import { getBadgeDetails, getSquareCoordinates } from '../../utils/chessAnnotations';
import { InteractiveTrial } from '../../types/chess';

interface ChessBoardViewProps {
  activeFen: string;
  boardOrientation: 'white' | 'black';
  whitePlayer: string;
  blackPlayer: string;
  interactiveTrial: InteractiveTrial | null;
  onResetTrial: () => void;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  currentMoveIndex: number;
  history: any[];
  currentAnnotation: any;
}

export const ChessBoardView: React.FC<ChessBoardViewProps> = React.memo(({
  activeFen,
  boardOrientation,
  whitePlayer,
  blackPlayer,
  interactiveTrial,
  onResetTrial,
  onPieceDrop,
  currentMoveIndex,
  history,
  currentAnnotation,
}) => {
  // Determine move evaluation badge to overlay on board
  const lastMove = currentMoveIndex >= 0 ? history[currentMoveIndex] : null;
  const badgeInfo = lastMove
    ? getBadgeDetails(
        currentAnnotation?.evaluation,
        lastMove.san.includes('+'),
        lastMove.san.includes('#')
      )
    : null;

  const badgeCoords = lastMove
    ? getSquareCoordinates(lastMove.to, boardOrientation)
    : null;

  const topPlayerLabel = boardOrientation === 'black' ? whitePlayer : blackPlayer;
  const topPlayerSymbol = boardOrientation === 'black' ? 'W' : 'B';

  const bottomPlayerLabel = boardOrientation === 'black' ? blackPlayer : whitePlayer;
  const bottomPlayerSymbol = boardOrientation === 'black' ? 'B' : 'W';

  return (
    <div className="bg-neutral-50 p-4 rounded-2xl shadow-sm border border-neutral-200 relative">
      {/* Top Player Info & Trial Reset Action */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
            {topPlayerSymbol}
          </div>
          <div className="font-semibold text-xs md:text-sm text-neutral-800">
            {topPlayerLabel}
          </div>
        </div>

        {interactiveTrial && (
          <button
            onClick={onResetTrial}
            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Reset variasi ke urutan game utama"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Trial</span>
          </button>
        )}
      </div>

      {/* Board Container */}
      <div className="w-full aspect-square max-w-[500px] mx-auto relative rounded-lg overflow-hidden shadow-sm">
        <Chessboard
          options={{
            id: 'tutorial-chessboard',
            position: activeFen,
            boardOrientation: boardOrientation,
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return onPieceDrop(sourceSquare, targetSquare);
            },
            darkSquareStyle: { backgroundColor: '#b58863' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
            animationDurationInMs: 200,
          }}
        />

        {/* Dynamic Move Classification Overlay Badge */}
        {badgeInfo && badgeCoords && (
          <div
            className={`absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md transition-all duration-300 ${badgeInfo.badgeClass}`}
            style={{
              left: badgeCoords.left,
              top: badgeCoords.top,
            }}
          >
            <span>{badgeInfo.icon}</span>
            <span>{badgeInfo.label}</span>
          </div>
        )}
      </div>

      {/* Bottom Player Info */}
      <div className="flex justify-between items-center mt-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white">
            {bottomPlayerSymbol}
          </div>
          <div className="font-semibold text-xs md:text-sm text-neutral-800">
            {bottomPlayerLabel}
          </div>
        </div>
      </div>
    </div>
  );
});

ChessBoardView.displayName = 'ChessBoardView';
