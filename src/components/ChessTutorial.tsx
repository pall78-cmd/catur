'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ListOrdered, FolderUp } from 'lucide-react';
import { pgn, overview } from '../data/analysis';
import { playMoveSound } from '../utils/chessAudio';
import { detectOpening } from '../data/openings';
import { useStockfish } from '../hooks/useStockfish';
import { useGameAnalysis } from '../lib/analysis/useGameAnalysis';
import { 
  getDynamicAnnotation, 
  calculateMoveStats, 
  generateFullPgn 
} from '../utils/chessAnnotations';
import { MovePairItem, InteractiveTrial, EngineBestMove } from '../types/chess';

// Subcomponents
import { ChessHeader } from './chess/ChessHeader';
import { ChessBoardView } from './chess/ChessBoardView';
import { ChessControls } from './chess/ChessControls';
import { FenPgnInput } from './chess/FenPgnInput';
import { ActiveMoveCard } from './chess/ActiveMoveCard';
import { MoveStatsPanel } from './chess/MoveStatsPanel';
import { MoveListTable } from './chess/MoveListTable';
import { PgnExportCard } from './chess/PgnExportCard';
import { StockfishWidget } from './chess/StockfishWidget';
import { PgnLibraryModal } from './chess/PgnLibraryModal';
import { PromotionModal } from './chess/PromotionModal';

export default function ChessTutorial() {
  const [game, setGame] = useState(() => new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isMuted, setIsMuted] = useState(false);

  const [activePgn, setActivePgn] = useState(pgn);
  const [customInput, setCustomInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [inputFeedback, setInputFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'moves' | 'io'>('moves');
  
  const [pendingPromotion, setPendingPromotion] = useState<{ sourceSquare: string; targetSquare: string; color: 'w' | 'b' } | null>(null);

  // Interactive trial review state
  const [interactiveTrial, setInteractiveTrial] = useState<InteractiveTrial | null>(null);

  // Per-move evaluation cache for accurate Stockfish analysis across all PGN positions
  const [perMoveEvalMap, setPerMoveEvalMap] = useState<Record<number, { evaluation?: string; engineBestMove?: EngineBestMove | null }>>({});

  // Compute active FEN for Stockfish & Board
  const activeFen = interactiveTrial ? interactiveTrial.fen : game.fen();

  // Stockfish 18 evaluation via custom hook (Depth 18 for enhanced tactical analysis)
  const { evaluation, engineBestMove, engineDepth, analysisTimeMs, clearEngineHash } = useStockfish(activeFen, { targetDepth: 18 });

  // Cache Stockfish evaluation for current move index when active
  useEffect(() => {
    if (currentMoveIndex >= 0 && !interactiveTrial && evaluation && !evaluation.includes('Mengevaluasi') && !evaluation.includes('Gagal')) {
      setPerMoveEvalMap(prev => {
        if (prev[currentMoveIndex]?.evaluation === evaluation) return prev;
        return {
          ...prev,
          [currentMoveIndex]: { evaluation, engineBestMove }
        };
      });
    }
  }, [currentMoveIndex, interactiveTrial, evaluation, engineBestMove]);

  // useGameAnalysis hook for background scanning of loaded PGN games
  const { 
    isAnalyzing: isAnalyzingGame, 
    progress: analysisProgress, 
    report: analysisReport, 
    runAnalysis 
  } = useGameAnalysis({ depth: 12 });

  // Sync full game analysis results into perMoveEvalMap
  useEffect(() => {
    if (analysisReport && analysisReport.moves) {
      const newPerMoveMap: Record<number, { evaluation?: string; engineBestMove?: EngineBestMove | null }> = {};
      analysisReport.moves.forEach((m: any, idx: number) => {
        newPerMoveMap[idx] = {
          evaluation: m.evaluation,
          engineBestMove: m.engineBestMove,
        };
      });
      setPerMoveEvalMap(newPerMoveMap);
    }
  }, [analysisReport]);

  // Clear evaluation cache when loading a new game to prevent mismatched evaluations
  useEffect(() => {
    setPerMoveEvalMap({});
  }, [activePgn]);

  // Parsed game based on activePgn
  const fullGame = useMemo(() => {
    const cg = new Chess();
    try {
      cg.loadPgn(activePgn);
    } catch (e) {
      console.error('PGN load error:', e);
    }
    return cg;
  }, [activePgn]);

  const history = useMemo(() => fullGame.history({ verbose: true }), [fullGame]);

  const isDefaultGame = useMemo(() => {
    return !isCustomMode && activePgn === pgn;
  }, [isCustomMode, activePgn]);

  const detectedOpening = useMemo(() => {
    return detectOpening(history);
  }, [history]);

  const activeOverview = useMemo(() => {
    if (isCustomMode) {
      return {
        white: 'Putih (Posisi Kustom)',
        black: 'Hitam (Posisi Kustom)',
        title: 'Analisis Posisi FEN Kustom',
        result: null,
      };
    }
    if (!activePgn || history.length === 0) {
      return {
        white: 'Pemain Putih',
        black: 'Pemain Hitam',
        title: 'Dasbor Analisis Catur Kustom',
        result: null,
      };
    }
    let headers: Record<string, string> = {};
    try {
      headers = fullGame.header();
    } catch (e) {
      headers = {};
    }
    const white = (headers['White'] && headers['White'] !== '?') ? headers['White'] : 'Pemain Putih';
    const black = (headers['Black'] && headers['Black'] !== '?') ? headers['Black'] : 'Pemain Hitam';
    const result = (headers['Result'] && headers['Result'] !== '*') ? headers['Result'] : null;
    const title = (white && black && white !== 'Pemain Putih')
      ? `Analisis Game: ${white} vs ${black}`
      : 'Analisis Game PGN';

    return {
      white,
      black,
      title,
      result,
    };
  }, [isCustomMode, activePgn, fullGame, history.length]);

  // Jump to move index
  const goToMove = useCallback((targetIndex: number) => {
    const newGame = new Chess();
    if (targetIndex >= 0 && targetIndex < history.length) {
      for (let i = 0; i <= targetIndex; i++) {
        newGame.move(history[i]);
      }
    }
    setGame(newGame);
    setCurrentMoveIndex(targetIndex);
    setInteractiveTrial(null);

    // Audio cue
    if (!isMuted && targetIndex >= 0 && targetIndex < history.length) {
      const move = history[targetIndex];
      const isCapture = Boolean(move.captured);
      const isCheck = move.san.includes('+');
      const isMate = move.san.includes('#');
      const isCastle = move.san === 'O-O' || move.san === 'O-O-O';
      playMoveSound(isCapture, isCheck, isCastle, isMate);
    }
  }, [history, isMuted]);

  // Navigation handlers
  const handleFirstMove = useCallback(() => {
    setIsPlaying(false);
    goToMove(-1);
  }, [goToMove]);

  const handlePrevMove = useCallback(() => {
    setIsPlaying(false);
    if (currentMoveIndex > -1) {
      goToMove(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, goToMove]);

  const handleNextMove = useCallback(() => {
    if (currentMoveIndex < history.length - 1) {
      goToMove(currentMoveIndex + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentMoveIndex, history.length, goToMove]);

  const handleLastMove = useCallback(() => {
    setIsPlaying(false);
    goToMove(history.length - 1);
  }, [history.length, goToMove]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleFlipBoard = useCallback(() => {
    setBoardOrientation(prev => (prev === 'white' ? 'black' : 'white'));
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Auto-play interval timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentMoveIndex < history.length - 1) {
          goToMove(currentMoveIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1800);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentMoveIndex, history.length, goToMove]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevMove();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextMove();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleFlipBoard();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleFirstMove();
      } else if (e.key === 'End') {
        e.preventDefault();
        handleLastMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevMove, handleNextMove, handleTogglePlay, handleFlipBoard, handleFirstMove, handleLastMove]);

  // Helper to apply a validated move
  const applyMove = useCallback((sourceSquare: string, targetSquare: string, promotionPiece?: string) => {
    try {
      const trialBase = new Chess();
      if (interactiveTrial) {
        trialBase.load(interactiveTrial.fen);
      } else {
        for (let i = 0; i <= currentMoveIndex; i++) {
          if (history[i]) trialBase.move(history[i]);
        }
      }

      const move = trialBase.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece || 'q',
      });

      if (move) {
        if (!isMuted) {
          const isCapture = Boolean(move.captured);
          const isCheck = move.san.includes('+');
          const isMate = move.san.includes('#');
          const isCastle = move.san === 'O-O' || move.san === 'O-O-O';
          playMoveSound(isCapture, isCheck, isCastle, isMate);
        }

        const isVeryFirstMove = currentMoveIndex === -1;
        const isAtEndOfHistory = currentMoveIndex === history.length - 1;

        if (isVeryFirstMove) {
          setActivePgn(trialBase.pgn());
          setIsCustomMode(true);
          setCurrentMoveIndex(0);
          setInteractiveTrial(null);
          setGame(trialBase);
        } else if ((isCustomMode || isAtEndOfHistory) && !interactiveTrial) {
          setActivePgn(trialBase.pgn());
          setIsCustomMode(true);
          setCurrentMoveIndex(prev => prev + 1);
          setInteractiveTrial(null);
          setGame(trialBase);
        } else {
          setInteractiveTrial({
            move,
            fen: trialBase.fen()
          });
        }
        return true;
      }
    } catch (e) {
      // invalid move
    }
    return false;
  }, [currentMoveIndex, history, isMuted, interactiveTrial, isCustomMode]);

  // Handle Drag-and-Drop and Click-to-Move interactive move review & manual play
  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    try {
      // Reconstruct board to validate
      const trialBase = new Chess();
      if (interactiveTrial) {
        trialBase.load(interactiveTrial.fen);
      } else {
        for (let i = 0; i <= currentMoveIndex; i++) {
          if (history[i]) trialBase.move(history[i]);
        }
      }

      // Check if this move requires promotion
      const piece = trialBase.get(sourceSquare as any);
      if (piece && piece.type === 'p' && (targetSquare[1] === '8' || targetSquare[1] === '1')) {
        const moves = trialBase.moves({ verbose: true });
        const isValidPromotion = moves.some(m => m.from === sourceSquare && m.to === targetSquare && m.flags.includes('p'));
        
        if (isValidPromotion) {
          setPendingPromotion({ sourceSquare, targetSquare, color: piece.color });
          return false; // Reject drop temporarily, wait for modal choice
        }
      }

      return applyMove(sourceSquare, targetSquare);
    } catch (e) {
      // Invalid drop
    }
    return false;
  }, [currentMoveIndex, history, interactiveTrial, applyMove]);

  // Handle loading custom FEN or PGN
  const handleLoadInput = useCallback(() => {
    setInputFeedback(null);
    setInteractiveTrial(null);
    setPerMoveEvalMap({});
    const str = customInput.trim();
    if (!str) return;

    // 1. Try loading as FEN
    try {
      const fenGame = new Chess(str);
      setGame(fenGame);
      setIsCustomMode(true);
      setCurrentMoveIndex(-1);
      setIsPlaying(false);
      setInputFeedback({ type: 'success', message: 'Posisi FEN kustom berhasil dimuat!' });
      return;
    } catch (e) {
      // Not a valid FEN, try PGN next
    }

    // 2. Try loading as PGN
    try {
      const pgnGame = new Chess();
      pgnGame.loadPgn(str);
      if (pgnGame.history().length > 0) {
        setActivePgn(str);
        setIsCustomMode(false);
        const resetGame = new Chess();
        setGame(resetGame);
        setCurrentMoveIndex(-1);
        setIsPlaying(false);
        setInputFeedback({ type: 'success', message: `PGN berhasil dimuat (${pgnGame.history().length} langkah)!` });
        return;
      }
    } catch (e) {
      // PGN failed
    }

    setInputFeedback({ type: 'error', message: 'Format FEN atau PGN tidak valid. Pastikan string disalin dengan benar.' });
  }, [customInput]);

  const handleResetGame = useCallback(() => {
    setActivePgn('');
    setIsCustomMode(true);
    setCustomInput('');
    setInteractiveTrial(null);
    setPerMoveEvalMap({});
    setInputFeedback({ type: 'success', message: 'Seluruh langkah telah dikosongkan. Silakan gerakkan bidak putih untuk memulai permainan baru.' });
    const resetGame = new Chess();
    setGame(resetGame);
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  }, []);

  // Memoized current active move details (main line or trial variation)
  const lastMove = currentMoveIndex >= 0 ? history[currentMoveIndex] : null;
  
  const currentAnnotation = useMemo(() => {
    const activeMove = interactiveTrial ? interactiveTrial.move : lastMove;
    const activeIdx = interactiveTrial ? currentMoveIndex + 1 : currentMoveIndex;
    if (!activeMove) return null;

    return getDynamicAnnotation(
      activeMove,
      activeIdx,
      history.length + (interactiveTrial ? 1 : 0),
      evaluation,
      engineBestMove,
      isDefaultGame,
      activeIdx,
      perMoveEvalMap
    );
  }, [interactiveTrial, lastMove, currentMoveIndex, history.length, evaluation, engineBestMove, isDefaultGame, perMoveEvalMap]);

  // Memoized Move pairs table data
  const movePairs = useMemo<MovePairItem[]>(() => {
    const pairs: MovePairItem[] = [];
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];

      const whiteAnn = getDynamicAnnotation(
        whiteMove, 
        i, 
        history.length, 
        evaluation, 
        engineBestMove, 
        isDefaultGame,
        currentMoveIndex,
        perMoveEvalMap
      );
      const blackAnn = blackMove 
        ? getDynamicAnnotation(
            blackMove, 
            i + 1, 
            history.length, 
            evaluation, 
            engineBestMove, 
            isDefaultGame,
            currentMoveIndex,
            perMoveEvalMap
          )
        : null;

      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: whiteMove,
        black: blackMove,
        whiteIndex: i,
        blackIndex: blackMove ? i + 1 : undefined,
        whiteEval: whiteAnn?.evaluation || '',
        blackEval: blackAnn?.evaluation || '',
      });
    }
    return pairs;
  }, [history, evaluation, engineBestMove, isDefaultGame, currentMoveIndex, perMoveEvalMap]);

  // Move Quality Statistics
  const moveStats = useMemo(() => {
    return calculateMoveStats(
      history, 
      evaluation, 
      engineBestMove, 
      isDefaultGame,
      currentMoveIndex,
      perMoveEvalMap
    );
  }, [history, evaluation, engineBestMove, isDefaultGame, currentMoveIndex, perMoveEvalMap]);

  // Export PGN string
  const fullPgnText = useMemo(() => {
    return generateFullPgn(
      history,
      activeOverview,
      detectedOpening,
      isDefaultGame,
      evaluation,
      engineBestMove,
      currentMoveIndex,
      perMoveEvalMap
    );
  }, [history, activeOverview, detectedOpening, isDefaultGame, evaluation, engineBestMove, currentMoveIndex, perMoveEvalMap]);

  // Dynamic overview text for game summary
  const dynamicOverviewText = useMemo(() => {
    if (isDefaultGame && activePgn === pgn) {
      return overview.evaluation;
    }

    const totalMoves = history.length;
    if (totalMoves === 0) {
      return 'Posisi kustom dianalisis. Lakukan langkah di papan atau gunakan tombol navigasi untuk memulai analisis.';
    }

    const white = activeOverview.white || 'Putih';
    const black = activeOverview.black || 'Hitam';
    const op = detectedOpening ? ` dengan pembukaan ${detectedOpening}` : '';
    const resultStr = activeOverview.result && activeOverview.result !== '*' ? ` Hasil akhir: ${activeOverview.result}.` : '';

    let summary = `Permainan ini berlangsung selama ${totalMoves} langkah${op}.${resultStr} `;
    summary += `Akurasi kalkulasi langkah ${white}: ${moveStats.whiteAccuracy}%, dan ${black}: ${moveStats.blackAccuracy}%. `;

    if (moveStats.totalStats.Brilian > 0) {
      summary += `Ditemukan ${moveStats.totalStats.Brilian} langkah brilian (💎) yang berdampak taktis signifikan! `;
    }
    if (moveStats.totalStats.Blunder > 0) {
      summary += `Terdapat ${moveStats.totalStats.Blunder} blunder kritis (💥) selama permainan.`;
    } else if (moveStats.whiteAccuracy >= 85 && moveStats.blackAccuracy >= 85) {
      summary += `Kedua pemain bertarung dengan sangat presisi teoretis dan minim kesalahan.`;
    } else {
      summary += `Mesin catur Stockfish menganalisis dinamika posisi dan peluang taktikal di setiap giliran.`;
    }

    return summary;
  }, [isDefaultGame, activePgn, history.length, activeOverview, detectedOpening, moveStats]);

  const handleSelectPreset = useCallback((presetPgn: string) => {
    try {
      const pgnGame = new Chess();
      pgnGame.loadPgn(presetPgn);
      if (pgnGame.history().length > 0) {
        setActivePgn(presetPgn);
        setIsCustomMode(false);
        setCustomInput('');
        setInteractiveTrial(null);
        const resetGame = new Chess();
        setGame(resetGame);
        setCurrentMoveIndex(-1);
        setIsPlaying(false);
        setInputFeedback({ type: 'success', message: 'Game contoh berhasil dimuat!' });
      }
    } catch (e) {
      setInputFeedback({ type: 'error', message: 'Gagal memuat game contoh.' });
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 font-sans select-none text-neutral-900">
      {/* 1. Page Header */}
      <ChessHeader
        title={activeOverview.title}
        detectedOpening={detectedOpening}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Board & Active Move Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          <ChessBoardView
            activeFen={activeFen}
            boardOrientation={boardOrientation}
            whitePlayer={activeOverview.white}
            blackPlayer={activeOverview.black}
            interactiveTrial={interactiveTrial}
            onResetTrial={() => setInteractiveTrial(null)}
            onPieceDrop={handlePieceDrop}
            onFlipBoard={handleFlipBoard}
            currentMoveIndex={currentMoveIndex}
            history={history}
            currentAnnotation={currentAnnotation}
            evaluation={evaluation}
            engineBestMove={engineBestMove}
          />
          
          <PromotionModal
            isOpen={pendingPromotion !== null}
            color={pendingPromotion?.color || 'w'}
            onSelect={(piece) => {
              if (pendingPromotion) {
                applyMove(pendingPromotion.sourceSquare, pendingPromotion.targetSquare, piece);
                setPendingPromotion(null);
              }
            }}
            onCancel={() => setPendingPromotion(null)}
          />

          {/* Active Move Description & Engine Evaluation (Analisis Langkah - Tepat di bawah papan catur) */}
          <ActiveMoveCard
            currentMoveIndex={currentMoveIndex}
            lastMove={lastMove}
            currentAnnotation={currentAnnotation}
            evaluation={evaluation}
            engineBestMove={engineBestMove}
            interactiveTrial={interactiveTrial}
            engineDepth={engineDepth}
          />

          {/* Stockfish 18 Engine Memory & Performance Widget */}
          <StockfishWidget
            engineDepth={engineDepth}
            analysisTimeMs={analysisTimeMs}
            engineBestMove={engineBestMove}
          />
        </div>

        {/* Right Column: Playback Controls, FEN/PGN Input, Move Quality Stats, Move List & PGN Export */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Playback Controls */}
          <ChessControls
            currentMoveIndex={currentMoveIndex}
            totalMoves={history.length}
            isPlaying={isPlaying}
            isMuted={isMuted}
            boardOrientation={boardOrientation}
            onFirst={handleFirstMove}
            onPrev={handlePrevMove}
            onTogglePlay={handleTogglePlay}
            onNext={handleNextMove}
            onLast={handleLastMove}
            onFlipBoard={handleFlipBoard}
            onToggleMute={handleToggleMute}
            onSliderChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setIsCustomMode(false);
              setInteractiveTrial(null);
              goToMove(val);
            }}
          />

          {/* Tab Navigation for Lower Right Panel */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-200/70 rounded-xl">
            <button
              onClick={() => setRightPanelTab('moves')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                rightPanelTab === 'moves'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
              <span>Langkah & Akurasi</span>
            </button>
            <button
              onClick={() => setRightPanelTab('io')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                rightPanelTab === 'io'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FolderUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Impor & Ekspor</span>
            </button>
          </div>

          {rightPanelTab === 'moves' ? (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              {/* Move Quality Statistics Summary Panel */}
              <MoveStatsPanel
                moveStats={moveStats}
                totalMoves={history.length}
                isDefaultGame={isDefaultGame}
                isAnalyzingGame={isAnalyzingGame}
                analysisProgress={analysisProgress}
                onRunAnalysis={() => {
                  runAnalysis(activePgn);
                }}
              />

              {/* Move List Navigation Table */}
              <MoveListTable
                movePairs={movePairs}
                currentMoveIndex={currentMoveIndex}
                onGoToMove={(idx) => {
                  setIsCustomMode(false);
                  setInteractiveTrial(null);
                  goToMove(idx);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              {/* FEN & PGN Input Section */}
              <FenPgnInput
                customInput={customInput}
                setCustomInput={setCustomInput}
                onLoadInput={() => {
                  handleLoadInput();
                  setRightPanelTab('moves');
                }}
                onResetGame={handleResetGame}
                isCustomMode={isCustomMode}
                isModifiedGame={activePgn !== pgn || isCustomMode}
                inputFeedback={inputFeedback}
                onSelectPreset={(p) => {
                  handleSelectPreset(p);
                  setRightPanelTab('moves');
                }}
                onOpenLibrary={() => setIsLibraryOpen(true)}
              />

              {/* Overview & Export PGN Card */}
              <PgnExportCard
                overviewText={dynamicOverviewText}
                fullPgnText={fullPgnText}
                onOpenLibrary={() => setIsLibraryOpen(true)}
              />
            </div>
          )}
        </div>

      </div>

      {/* IndexedDB PGN Storage Collection Modal */}
      <PgnLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPgn={handleSelectPreset}
        currentPgnText={fullPgnText}
      />
    </div>
  );
}
