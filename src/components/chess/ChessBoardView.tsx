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
  playSpeedMs?: number;
  isPlaying?: boolean;
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
  playSpeedMs = 2800,
  isPlaying = false,
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
        backgroundColor: 'rgba(250, 204, 21, 0.38)',
        borderRadius: '3px',
      };
      styles[activeMoveForBadge.to] = {
        backgroundColor: 'rgba(234, 179, 8, 0.65)',
        boxShadow: 'inset 0 0 6px rgba(161, 98, 7, 0.35)',
        borderRadius: '3px',
      };
    }
    if (engineBestMove && engineBestMove.to) {
      styles[engineBestMove.to] = {
        ...(styles[engineBestMove.to] || {}),
        boxShadow: 'inset 0 0 0 3px #10b981, inset 0 0 8px rgba(16, 185, 129, 0.35)',
        borderRadius: '4px',
      };
    }
    if (moveFrom) {
      styles[moveFrom] = {
        backgroundColor: 'rgba(250, 204, 21, 0.45)',
        boxShadow: 'inset 0 0 0 2px rgba(202, 138, 4, 0.8)',
        borderRadius: '4px',
      };
    }
    legalTargetSquares.forEach((square) => {
      styles[square] = {
        ...(styles[square] || {}),
        backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.55) 28%, transparent 28%)',
        cursor: 'pointer',
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

  const dynamicAnimationDuration = useMemo(() => {
    if (!isPlaying) return 180;
    if (!playSpeedMs) return 220;
    const calc = Math.round(playSpeedMs * 0.11);
    return Math.min(260, Math.max(100, calc));
  }, [playSpeedMs, isPlaying]);

  const chessboardOptions = useMemo(() => ({
    position: activeFen,
    boardOrientation: boardOrientation,
    animationDurationInMs: dynamicAnimationDuration,
    showAnimations: true,
    allowDragging: false,
    onSquareClick: ({ square }: any) => handleSquareClick(typeof square === 'string' ? square : square.square || square),
    squareStyles: highlightStyles,
    darkSquareStyle: { backgroundColor: '#b58863' },
    lightSquareStyle: { backgroundColor: '#f0d9b5' },
    boardStyle: { borderRadius: '0.5rem' },
  }), [activeFen, boardOrientation, highlightStyles, dynamicAnimationDuration]);

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
            options={chessboardOptions}
          />

          {/* Dynamic Move Classification Overlay Badge */}
          {badgeInfo && badgeCoords && (
            <div
              className={`absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md transition-all duration-300 ${badgeInfo.badgeClass}`}
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

