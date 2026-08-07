import React, { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';
import { getBadgeDetails, getSquareCoordinates } from '../../utils/chessAnnotations';
import { InteractiveTrial, EngineBestMove } from '../../types/chess';
import { EvaluationBar } from './EvaluationBar';

interface ChessBoardViewProps {
  activeFen: string;
  boardOrientation: 'white' | 'black';
  whitePlayer: string;
  blackPlayer: string;
  interactiveTrial: InteractiveTrial | null;
  onResetTrial: () => void;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  onFlipBoard?: () => void;
  currentMoveIndex: number;
  history: any[];
  currentAnnotation: any;
  evaluation?: string;
  engineBestMove?: EngineBestMove | null;
}

export const ChessBoardView: React.FC<ChessBoardViewProps> = React.memo(({
  activeFen,
  boardOrientation,
  whitePlayer,
  blackPlayer,
  interactiveTrial,
  onResetTrial,
  onPieceDrop,
  onFlipBoard,
  currentMoveIndex,
  history,
  currentAnnotation,
  evaluation = '0.0',
  engineBestMove,
}) => {
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [legalTargetSquares, setLegalTargetSquares] = useState<string[]>([]);

  // Determine move evaluation badge to overlay on board for either regular history move or variation trial
  const lastMove = currentMoveIndex >= 0 ? history[currentMoveIndex] : null;
  const activeMoveForBadge = interactiveTrial ? interactiveTrial.move : lastMove;

  const badgeInfo = activeMoveForBadge
    ? getBadgeDetails(
        currentAnnotation?.evaluation,
        activeMoveForBadge.san.includes('+'),
        activeMoveForBadge.san.includes('#')
      )
    : null;

  const badgeCoords = activeMoveForBadge
    ? getSquareCoordinates(activeMoveForBadge.to, boardOrientation)
    : null;

  // Lightweight highlight styles for source and target squares of the last move or trial move + Stockfish recommendation + moveFrom + legal moves
  const highlightStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (activeMoveForBadge?.from && activeMoveForBadge?.to) {
      styles[activeMoveForBadge.from] = {
        backgroundColor: 'rgba(255, 230, 0, 0.38)',
        borderRadius: '3px',
      };
      styles[activeMoveForBadge.to] = {
        backgroundColor: 'rgba(255, 195, 0, 0.65)',
        borderRadius: '3px',
      };
    }
    if (engineBestMove && engineBestMove.to) {
      styles[engineBestMove.to] = {
        ...(styles[engineBestMove.to] || {}),
        boxShadow: 'inset 0 0 0 3px #10b981',
        borderRadius: '4px',
      };
    }
    if (moveFrom) {
      styles[moveFrom] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '4px',
      };
    }
    legalTargetSquares.forEach((square) => {
      styles[square] = {
        ...(styles[square] || {}),
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.25) 25%, transparent 25%)',
      };
    });
    return styles;
  }, [activeMoveForBadge, engineBestMove, moveFrom, legalTargetSquares]);

  function handleSquareClick(square: string) {
    if (moveFrom) {
      const success = onPieceDrop(moveFrom, square);
      if (!success) {
        // If clicking another piece, check if it's ours by attempting to get moves
        const chess = new Chess(activeFen);
        const moves = chess.moves({ square: square as any, verbose: true }) as any[];
        if (moves.length > 0) {
           setMoveFrom(square);
           setLegalTargetSquares(moves.map(m => m.to));
        } else {
           setMoveFrom(null);
           setLegalTargetSquares([]);
        }
      } else {
        setMoveFrom(null);
        setLegalTargetSquares([]);
      }
    } else {
      const chess = new Chess(activeFen);
      const moves = chess.moves({ square: square as any, verbose: true }) as any[];
      if (moves.length > 0) {
        setMoveFrom(square);
        setLegalTargetSquares(moves.map(m => m.to));
      } else {
        setMoveFrom(null);
        setLegalTargetSquares([]);
      }
    }
  }

  const chessboardOptions = useMemo(() => ({
    position: activeFen,
    boardOrientation: boardOrientation,
    onPieceDrop: ({ sourceSquare, targetSquare }: any) => {
      setMoveFrom(null); // Clear tap state if dragged
      setLegalTargetSquares([]);
      if (!sourceSquare || !targetSquare) return false;
      return onPieceDrop(sourceSquare, targetSquare);
    },
    onSquareClick: ({ square }: any) => handleSquareClick(square),
    darkSquareStyle: { backgroundColor: '#b58863' },
    lightSquareStyle: { backgroundColor: '#f0d9b5' },
    squareStyles: highlightStyles,
    animationDurationInMs: 200,
    allowDragging: false, // The user requested to disable dragging ("jangan pake logika drag deh pake aja klik")
  }), [activeFen, boardOrientation, onPieceDrop, highlightStyles, moveFrom]);

  const topPlayerLabel = boardOrientation === 'black' ? whitePlayer : blackPlayer;
  const topPlayerSymbol = boardOrientation === 'black' ? 'W' : 'B';
  const bottomPlayerLabel = boardOrientation === 'black' ? blackPlayer : whitePlayer;
  const bottomPlayerSymbol = boardOrientation === 'black' ? 'B' : 'W';

  return (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl shadow-2xs border border-neutral-200/90 relative">
      {/* Top Player Info & Actions */}
      <div className="flex justify-between items-center mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-bold text-neutral-700">
            {topPlayerSymbol}
          </div>
          <div className="font-bold text-xs sm:text-sm text-neutral-800">
            {topPlayerLabel}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {interactiveTrial && (
            <button
              onClick={onResetTrial}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Hapus variasi kustom & kembali ke urutan game utama"
            >
              <RotateCcw className="w-3 h-3 text-amber-600" />
              <span>Hapus Variasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Board & Evaluation Bar Flex Wrapper */}
      <div className="w-full max-w-[480px] mx-auto flex items-stretch gap-2">
        {/* Dynamic Stockfish Evaluation Bar */}
        <EvaluationBar
          evaluation={evaluation}
          boardOrientation={boardOrientation}
        />

        {/* Board Container */}
        <div className="flex-1 aspect-square relative rounded-lg overflow-hidden shadow-xs border border-neutral-300/80 z-10">
          <Chessboard
            // @ts-ignore - TS doesn't know about key here but we need it to remount
            key={boardOrientation}
            options={chessboardOptions}
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
      </div>

      {/* Bottom Player Info */}
      <div className="flex justify-between items-center mt-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-white">
            {bottomPlayerSymbol}
          </div>
          <div className="font-bold text-xs sm:text-sm text-neutral-800">
            {bottomPlayerLabel}
          </div>
        </div>
      </div>
    </div>
  );
});

ChessBoardView.displayName = 'ChessBoardView';

