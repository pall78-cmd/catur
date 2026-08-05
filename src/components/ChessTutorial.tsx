'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { pgn, annotations, overview } from '../data/analysis';

export default function ChessTutorial() {
  const [game, setGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('black');
  
  const [activePgn, setActivePgn] = useState(pgn);
  const [customInput, setCustomInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [inputFeedback, setInputFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [evaluation, setEvaluation] = useState<string>('');
  const [engineBestMove, setEngineBestMove] = useState<{from: string, to: string} | null>(null);
  const engineRef = useRef<Worker | null>(null);

  const [debugLine, setDebugLine] = useState<string>('');
  
  const turnRef = useRef(game.turn());
  useEffect(() => {
    turnRef.current = game.turn();
  }, [game.fen()]);

  useEffect(() => {
    engineRef.current = new Worker('/stockfish.js');
    engineRef.current.postMessage('uci');
    
    engineRef.current.onerror = (err) => {
      console.error('Stockfish worker error', err);
      setEvaluation('Gagal memuat mesin');
    };

    engineRef.current.onmessage = (e) => {
      let line = e.data;
      if (line && typeof line === 'object' && typeof line.data === 'string') {
        line = line.data;
      }
      if (typeof line === 'string') {
        setDebugLine(line.substring(0, 50));
        const pvMatch = line.match(/pv ([a-h][1-8])([a-h][1-8])/);
        if (pvMatch) {
          setEngineBestMove({ from: pvMatch[1], to: pvMatch[2] });
        }

        const match = line.match(/score (cp|mate) (-?\d+)/);
        if (match) {
          const type = match[1];
          const val = parseInt(match[2], 10);
          
          setEvaluation((prev) => {
            let scoreStr = '';
            const isBlack = turnRef.current === 'b';
            
            if (type === 'cp') {
              let score = val / 100;
              if (isBlack) score = -score;
              scoreStr = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
            } else if (type === 'mate') {
              let mateMoves = val;
              if (isBlack) mateMoves = -mateMoves;
              scoreStr = mateMoves > 0 ? `+M${Math.abs(mateMoves)}` : `-M${Math.abs(mateMoves)}`;
            }
            return scoreStr;
          });
        }
      }
    };
    return () => {
      engineRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.postMessage('stop');
      engineRef.current.postMessage(`position fen ${game.fen()}`);
      engineRef.current.postMessage('go depth 12');
      setEvaluation('Mengevaluasi...');
      setEngineBestMove(null);
    }
  }, [game.fen()]);

  const handleLoadInput = () => {
    setInputFeedback(null);
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

    // 2. Try loading as PGN (e.g. from Chess.com or Lichess)
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
  };

  const handleResetGame = () => {
    setActivePgn(pgn);
    setIsCustomMode(false);
    setCustomInput('');
    setInputFeedback({ type: 'success', message: 'Game tutorial awal berhasil dikembalikan.' });
    const resetGame = new Chess();
    setGame(resetGame);
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setIsCustomMode(false);
    goToMove(val);
  };
  
  // Parse the full game based on activePgn
  const fullGame = useMemo(() => {
    const cg = new Chess();
    try {
      cg.loadPgn(activePgn);
    } catch (e) {
      console.error('PGN load error:', e);
    }
    return cg;
  }, [activePgn]);

  const activeOverview = useMemo(() => {
    if (isCustomMode) {
      return {
        white: 'Putih (Posisi Kustom)',
        black: 'Hitam (Posisi Kustom)',
        title: 'Analisis Posisi FEN Kustom',
        result: null,
      };
    }
    let headers: Record<string, string> = {};
    try {
      headers = fullGame.header();
    } catch (e) {
      headers = {};
    }
    const white = (headers['White'] && headers['White'] !== '?') ? headers['White'] : overview.white;
    const black = (headers['Black'] && headers['Black'] !== '?') ? headers['Black'] : overview.black;
    const event = (headers['Event'] && headers['Event'] !== '?') ? headers['Event'] : null;
    const date = (headers['Date'] && headers['Date'] !== '?') ? headers['Date'] : null;
    const result = (headers['Result'] && headers['Result'] !== '*') ? headers['Result'] : null;

    let title = overview.title;
    if (event && event !== 'Live Chess') {
      title = `${event}${date ? ` (${date})` : ''}`;
    } else if (white && black && (white !== overview.white || black !== overview.black)) {
      title = `${white} vs ${black}${result ? ` (${result})` : ''}`;
    }

    return { white, black, title, result };
  }, [fullGame, isCustomMode]);

  const history = useMemo(() => fullGame.history({ verbose: true }), [fullGame]);

  const goToMove = (index: number) => {
    setIsCustomMode(false);
    const newGame = new Chess();
    for (let i = 0; i <= index; i++) {
      if (history[i]) {
        newGame.move(history[i]);
      }
    }
    setGame(newGame);
    setCurrentMoveIndex(index);
  };

  const nextMove = () => {
    if (currentMoveIndex < history.length - 1) {
      goToMove(currentMoveIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const prevMove = () => {
    if (currentMoveIndex >= 0) {
      goToMove(currentMoveIndex - 1);
    }
  };

  const firstMove = () => goToMove(-1);
  const lastMove = () => goToMove(history.length - 1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentMoveIndex < history.length - 1) {
          nextMove();
        } else {
          setIsPlaying(false);
        }
      }, 3000); // 3 seconds per move for comfortable reading
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIndex, history.length]);

  const plyNumber = currentMoveIndex + 1;
  const currentAnnotation = annotations[plyNumber];
  
  // Format move list for display
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      whiteEval: annotations[i + 1]?.evaluation,
      black: history[i + 1] || null,
      blackEval: annotations[i + 2]?.evaluation,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  // Determine last move to highlight
  const lastMoveObj = currentMoveIndex >= 0 ? history[currentMoveIndex] : null;
  const customSquareStyles = lastMoveObj ? {
    [lastMoveObj.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    [lastMoveObj.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
  } : {};

  const generateStrategicAdvice = () => {
    const fenParts = game.fen().split(' ');
    const fullMove = parseInt(fenParts[5] || '1', 10);
    const sideToMove = fenParts[1] === 'w' ? 'Putih' : 'Hitam';
    
    let phase = '';
    let priority = '';
    
    if (fullMove <= 10) {
      phase = 'Pembukaan (Opening)';
      priority = 'Kembangkan perwira ringan, rokade untuk keamanan raja, dan kendalikan petak pusat.';
    } else if (fullMove <= 30) {
      phase = 'Pertengahan (Midgame)';
      priority = 'Rumuskan rencana serangan, amati koordinasi perwira, dan eksploitasi kelemahan struktur lawan.';
    } else {
      phase = 'Akhir Permainan (Endgame)';
      priority = 'Aktifkan raja sebagai penyerang, lindungi bidak bebas, dan bersiap untuk promosi bidak.';
    }

    let blunderWarning = '';
    if (evaluation && !evaluation.includes('Mengevaluasi')) {
      const isMate = evaluation.includes('M');
      const scoreStr = evaluation.replace('+', '');
      const score = parseFloat(scoreStr);
      
      const isBadForWhite = (isMate && evaluation.startsWith('-')) || score < -3;
      const isBadForBlack = (isMate && evaluation.startsWith('+')) || score > 3;

      if ((sideToMove === 'Putih' && isBadForWhite) || (sideToMove === 'Hitam' && isBadForBlack)) {
        blunderWarning = `Posisi sangat kritis untuk ${sideToMove}. Ada ancaman taktis (kemungkinan blunder). Improvisasi & Pencegahan: Sebelum melangkah, selalu periksa skak (checks), tangkapan (captures), dan ancaman (threats). Pastikan perwira utama tidak menggantung.`;
      }
    }

    return { phase, priority, blunderWarning };
  };

  const advice = generateStrategicAdvice();

  const getEvaluationSymbol = (evaluation?: string) => {
    if (!evaluation) return null;
    switch (evaluation) {
      case 'Blunder': return <span className="text-red-600 font-bold ml-1" title="Blunder">??</span>;
      case 'Kesalahan': return <span className="text-orange-500 font-bold ml-1" title="Kesalahan">?</span>;
      case 'Ketidakakuratan': return <span className="text-yellow-500 font-bold ml-1" title="Ketidakakuratan">?!</span>;
      case 'Bagus': return <span className="text-green-500 font-bold ml-1" title="Bagus">!</span>;
      case 'Langkah Terbaik': return <span className="text-emerald-500 font-bold ml-1" title="Langkah Terbaik">★</span>;
      case 'Langkah Brilian': return <span className="text-cyan-500 font-bold ml-1" title="Langkah Brilian">!!</span>;
      case 'Langkah Terlewat': return <span className="text-purple-500 font-bold ml-1" title="Langkah Terlewat">✖</span>;
      default: return null;
    }
  };

  let customArrows = [];
  if (lastMoveObj && currentAnnotation?.evaluation) {
    let arrowColor = 'rgba(255, 170, 0, 0.5)';
    switch (currentAnnotation.evaluation) {
      case 'Blunder': arrowColor = 'rgba(220, 38, 38, 0.8)'; break;
      case 'Kesalahan': arrowColor = 'rgba(234, 88, 12, 0.8)'; break;
      case 'Ketidakakuratan': arrowColor = 'rgba(202, 138, 4, 0.8)'; break;
      case 'Bagus': arrowColor = 'rgba(22, 163, 74, 0.8)'; break;
      case 'Langkah Terbaik': arrowColor = 'rgba(5, 150, 105, 0.8)'; break;
      case 'Langkah Brilian': arrowColor = 'rgba(8, 145, 178, 0.8)'; break;
      case 'Langkah Terlewat': arrowColor = 'rgba(147, 51, 234, 0.8)'; break;
    }
    customArrows.push({
      startSquare: lastMoveObj.from,
      endSquare: lastMoveObj.to,
      color: arrowColor,
    });
  }
  
  if (engineBestMove) {
    customArrows.push({
      startSquare: engineBestMove.from,
      endSquare: engineBestMove.to,
      color: 'rgba(34, 197, 94, 0.8)', // Green for engine best move
    });
  }

  const getEvaluationBadgeStyle = (evaluation?: string) => {
    if (!evaluation) return '';
    switch (evaluation) {
      case 'Blunder':
        return 'bg-red-900/80 text-red-100 border-red-700';
      case 'Kesalahan':
        return 'bg-orange-600/80 text-orange-100 border-orange-500';
      case 'Ketidakakuratan':
        return 'bg-yellow-600/80 text-yellow-100 border-yellow-500';
      case 'Bagus':
        return 'bg-green-600/80 text-green-100 border-green-500';
      case 'Langkah Terbaik':
        return 'bg-emerald-600/80 text-emerald-100 border-emerald-500';
      case 'Langkah Brilian':
        return 'bg-cyan-600/80 text-cyan-100 border-cyan-500';
      case 'Langkah Terlewat':
        return 'bg-purple-600/80 text-purple-100 border-purple-500';
      default:
        return 'bg-neutral-700 text-neutral-200 border-neutral-600';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 flex flex-col">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-2 font-serif">{activeOverview.title}</h1>
        <p className="text-neutral-500 text-sm md:text-base font-medium uppercase tracking-wider">
          Interactive POV Analysis
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Board and Controls */}
        <div className="w-full lg:w-7/12 shrink-0 flex flex-col gap-4">
          <div className="bg-neutral-50 p-4 md:p-5 rounded-2xl shadow-sm border border-neutral-200">
            {/* Player Info (Top) */}
            <div className="flex justify-between items-center mb-3 px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600">
                   {boardOrientation === 'black' ? 'W' : 'B'}
                </div>
                <div className="font-semibold text-sm text-neutral-800">
                  {boardOrientation === 'black' ? activeOverview.white : activeOverview.black}
                </div>
              </div>
            </div>

            {/* Board */}
            <div className="w-full aspect-square relative rounded-lg overflow-hidden shadow-sm">
              <Chessboard 
                options={{
                  position: game.fen(),
                  boardOrientation: boardOrientation,
                  squareStyles: customSquareStyles,
                  arrows: customArrows,
                  showAnimations: false,
                  darkSquareStyle: { backgroundColor: '#a3a3a3' },
                  lightSquareStyle: { backgroundColor: '#f5f5f5' }
                }}
              />
            </div>

            {/* Player Info (Bottom) */}
            <div className="flex justify-between items-center mt-3 px-1">
              <div className="flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-white">
                  {boardOrientation === 'black' ? 'B' : 'W'}
                </div>
                <div className="font-semibold text-sm text-neutral-800">
                   {boardOrientation === 'black' ? activeOverview.black : activeOverview.white}
                </div>
              </div>
            </div>

            {/* Simplified Controls & Slider */}
            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                {/* Flip Board */}
                <button 
                  onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')} 
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Putar Papan"
                >
                  <div className="flex flex-col items-center leading-none">
                    <ChevronUp className="w-3 h-3 -mb-1" />
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <span className="hidden sm:inline">Putar</span>
                </button>

                {/* Simplified Playback Buttons */}
                <div className="flex items-center gap-1">
                  <button onClick={firstMove} disabled={currentMoveIndex === -1} className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg disabled:opacity-30 transition-all" title="Awal">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button onClick={prevMove} disabled={currentMoveIndex === -1} className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg disabled:opacity-30 transition-all" title="Sebelumnya">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setIsPlaying(!isPlaying)} className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1 shadow-sm">
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                  </button>

                  <button onClick={nextMove} disabled={currentMoveIndex === history.length - 1} className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg disabled:opacity-30 transition-all" title="Berikutnya">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button onClick={lastMove} disabled={currentMoveIndex === history.length - 1} className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg disabled:opacity-30 transition-all" title="Akhir">
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Move Indicator */}
                <div className="text-xs font-semibold text-neutral-600 bg-neutral-200/60 px-2.5 py-1 rounded-md">
                  {currentMoveIndex + 1} / {history.length}
                </div>
              </div>

              {/* Move Slider */}
              <div className="px-1 pt-1">
                <input 
                  type="range" 
                  min="-1" 
                  max={history.length - 1} 
                  value={currentMoveIndex} 
                  onChange={handleSliderChange}
                  className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Current Move Annotation & Engine Evaluation */}
          <div className="bg-neutral-900 text-white rounded-2xl shadow-md p-5 relative overflow-hidden flex flex-col gap-3">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
             
             {/* Engine Evaluation Header */}
             <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
               <span className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Stockfish 18</span>
               <div className="flex items-center gap-2">
                 {engineBestMove && !evaluation.includes('Mengevaluasi') && (
                   <span className="text-[11px] font-semibold px-2 py-0.5 bg-neutral-800 rounded text-neutral-300 border border-neutral-700">
                     Saran: {engineBestMove.from} → {engineBestMove.to}
                   </span>
                 )}
                 {evaluation.includes('Mengevaluasi') ? (
                   <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium">
                      <div className="w-3 h-3 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin"></div>
                      Menghitung...
                   </div>
                 ) : (
                   <span className={`font-bold text-sm ${evaluation.startsWith('+') ? 'text-emerald-400' : evaluation.startsWith('-') ? 'text-rose-400' : 'text-amber-400'}`}>
                     {evaluation}
                   </span>
                 )}
               </div>
             </div>
             
             {/* PGN Annotation */}
             {isCustomMode ? (
               <div className="flex flex-col justify-center items-center text-center text-neutral-400 py-1">
                 <p className="text-amber-400 font-bold mb-1 text-sm">Posisi Kustom ({advice.phase})</p>
                 <p className="text-xs">Gunakan saran langkah dari mesin di atas.</p>
               </div>
             ) : currentMoveIndex === -1 ? (
               <div className="flex flex-col justify-center items-center text-center text-neutral-400 py-1">
                 <p className="text-xs">Klik "Berikutnya" atau putar langkah untuk memulai analisis.</p>
               </div>
             ) : (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-neutral-800 text-amber-400 px-2.5 py-0.5 rounded text-xs font-bold border border-neutral-700">
                      Langkah {Math.floor(currentMoveIndex / 2) + 1}{currentMoveIndex % 2 === 0 ? '. ' : '... '}{history[currentMoveIndex]?.san}
                    </span>
                    {currentAnnotation?.evaluation && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getEvaluationBadgeStyle(currentAnnotation.evaluation)}`}>
                        {currentAnnotation.evaluation}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-neutral-200 leading-relaxed text-sm">
                    {currentAnnotation?.annotation || "Tidak ada anotasi detail untuk langkah ini."}
                  </p>

                  {currentAnnotation?.alternatives && (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">Alternatif</span>
                      <p className="text-xs text-neutral-400">{currentAnnotation.alternatives}</p>
                    </div>
                  )}
               </div>
             )}

             {/* Strategic Advice */}
             <div className="mt-1 pt-3 border-t border-neutral-800">
               <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Saran Strategis ({advice.phase})</h4>
               <p className="text-xs text-neutral-300 leading-relaxed">
                 {advice.priority}
               </p>
               {advice.blunderWarning && (
                 <div className="mt-2 p-2.5 bg-rose-950/40 border border-rose-900/50 rounded-lg">
                   <p className="text-xs text-rose-300 leading-relaxed font-medium">
                     ⚠️ {advice.blunderWarning}
                   </p>
                 </div>
               )}
             </div>
          </div>

          {/* FEN & PGN Input Section (Compact & Placed Lower) */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Muat Posisi / Game (FEN / PGN)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input 
                type="text" 
                placeholder="Tempelkan FEN atau PGN di sini..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={handleLoadInput}
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Muat FEN / PGN
                </button>
                {(activePgn !== pgn || isCustomMode) && (
                  <button 
                    onClick={handleResetGame}
                    className="px-2.5 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                    title="Kembali ke Game Tutorial Awal"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {inputFeedback && (
              <div className={`text-[11px] px-2.5 py-1 rounded-md font-medium ${
                inputFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {inputFeedback.message}
              </div>
            )}

            {debugLine && (
              <div className="text-[10px] text-neutral-400 font-mono truncate">
                Status Mesin: {debugLine}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Analysis and Move List */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6 h-full">
          
          {/* Overview Card (Shown if no move or overview tab) */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 border-b border-neutral-100 pb-2">Ringkasan Game</h2>
            <p className="text-neutral-700 leading-relaxed text-sm">
              {overview.evaluation}
            </p>
          </div>

          {/* Move List */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex-1 overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h3 className="font-bold text-neutral-800 text-sm uppercase tracking-wider">Daftar Langkah</h3>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
               <table className="w-full text-sm">
                 <tbody>
                   {movePairs.map((pair) => (
                       <tr key={pair.moveNumber} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 text-neutral-400 font-medium w-12 text-right">
                          {pair.moveNumber}.
                        </td>
                        <td className="py-2.5 px-2">
                           <button 
                             onClick={() => goToMove(pair.whiteIndex)}
                             className={`w-full text-left px-2 py-1 rounded transition-colors ${currentMoveIndex === pair.whiteIndex ? 'bg-amber-100 text-amber-900 font-bold active-move' : 'text-neutral-700 hover:bg-neutral-200'}`}
                           >
                             {pair.white.san}{getEvaluationSymbol(pair.whiteEval)}
                           </button>
                        </td>
                        <td className="py-2.5 px-2">
                          {pair.black && (
                            <button 
                              onClick={() => goToMove(pair.blackIndex)}
                              className={`w-full text-left px-2 py-1 rounded transition-colors ${currentMoveIndex === pair.blackIndex ? 'bg-amber-100 text-amber-900 font-bold active-move' : 'text-neutral-700 hover:bg-neutral-200'}`}
                            >
                              {pair.black.san}{getEvaluationSymbol(pair.blackEval)}
                            </button>
                          )}
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
