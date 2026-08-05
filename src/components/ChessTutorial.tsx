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
  
  const [customFenInput, setCustomFenInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const [evaluation, setEvaluation] = useState<string>('');
  const engineRef = useRef<Worker | null>(null);

  useEffect(() => {
    engineRef.current = new Worker('/stockfish.js');
    engineRef.current.onmessage = (e) => {
      const line = e.data;
      if (typeof line === 'string') {
        const match = line.match(/score (cp|mate) (-?\d+)/);
        if (match) {
          const type = match[1];
          const val = parseInt(match[2], 10);
          
          setEvaluation((prev) => {
            // Evaluasi dari perspektif pihak yang jalan
            let scoreStr = '';
            if (type === 'cp') {
              const score = val / 100;
              scoreStr = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
            } else if (type === 'mate') {
              scoreStr = val > 0 ? `+M${Math.abs(val)}` : `-M${Math.abs(val)}`;
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
      engineRef.current.postMessage('go depth 10');
      setEvaluation('Mengevaluasi...');
    }
  }, [game.fen()]);

  const handleLoadFen = () => {
    try {
      const newGame = new Chess(customFenInput);
      setGame(newGame);
      setIsCustomMode(true);
      setCurrentMoveIndex(-1);
      setIsPlaying(false);
    } catch (e) {
      alert("FEN tidak valid");
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setIsCustomMode(false);
    goToMove(val);
  };
  
  // Parse the full game
  const fullGame = useMemo(() => {
    const cg = new Chess();
    cg.loadPgn(pgn);
    return cg;
  }, []);

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
      }, 1500); // 1.5 seconds per move
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
      black: history[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  // Ref for auto-scrolling
  const moveListRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isPlaying && moveListRef.current) {
      const activeElement = moveListRef.current.querySelector('.active-move');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentMoveIndex, isPlaying]);

  // Determine last move to highlight
  const lastMoveObj = currentMoveIndex >= 0 ? history[currentMoveIndex] : null;
  const customSquareStyles = lastMoveObj ? {
    [lastMoveObj.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    [lastMoveObj.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
  } : {};

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 flex flex-col">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-2 font-serif">{overview.title}</h1>
        <p className="text-neutral-500 text-sm md:text-base font-medium uppercase tracking-wider">
          Interactive POV Analysis
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Board and Controls */}
        <div className="w-full lg:w-7/12 shrink-0">
          <div className="bg-neutral-50 p-4 md:p-6 rounded-2xl shadow-sm border border-neutral-200">
            {/* Player Info (Top) */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-bold text-neutral-500">
                   {boardOrientation === 'black' ? 'W' : 'B'}
                </div>
                <div className="font-semibold text-neutral-800">
                  {boardOrientation === 'black' ? overview.white : overview.black}
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
                  animationDurationInMs: 300,
                  darkSquareStyle: { backgroundColor: '#a3a3a3' },
                  lightSquareStyle: { backgroundColor: '#f5f5f5' }
                }}
              />
            </div>

            {/* Player Info (Bottom) */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl font-bold text-white">
                  {boardOrientation === 'black' ? 'B' : 'W'}
                </div>
                <div className="font-semibold text-neutral-800">
                   {boardOrientation === 'black' ? overview.black : overview.white}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-2 bg-white rounded-xl border border-neutral-100 shadow-sm">
              <button onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')} className="p-3 text-neutral-500 hover:text-neutral-900 transition-colors mr-auto" title="Flip Board">
                <ChevronUp className="w-5 h-5 absolute opacity-0" /> {/* dummy icon for spacing */}
                <div className="flex flex-col items-center leading-none">
                  <ChevronUp className="w-4 h-4 -mb-1" />
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <div className="flex items-center gap-1">
                <button onClick={firstMove} disabled={currentMoveIndex === -1} className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={prevMove} disabled={currentMoveIndex === -1} className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-4 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all mx-2 shadow-md">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <button onClick={nextMove} disabled={currentMoveIndex === history.length - 1} className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button onClick={lastMove} disabled={currentMoveIndex === history.length - 1} className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <div className="ml-auto w-10"></div> {/* Spacer to center the controls */}
            </div>

            {/* Slider */}
            <div className="mt-4 px-2">
              <input 
                type="range" 
                min="-1" 
                max={history.length - 1} 
                value={currentMoveIndex} 
                onChange={handleSliderChange}
                className="w-full accent-neutral-900"
              />
            </div>

            {/* FEN Input & Evaluation */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Masukkan FEN string untuk posisi kustom..."
                  value={customFenInput}
                  onChange={(e) => setCustomFenInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
                />
                <button 
                  onClick={handleLoadFen}
                  className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Muat
                </button>
              </div>
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-neutral-500 font-medium">Evaluasi Mesin (Stockfish):</span>
                <span className={`font-bold ${evaluation.includes('Mengevaluasi') ? 'text-neutral-400' : evaluation.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {evaluation || 'N/A'}
                </span>
              </div>
            </div>
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

          {/* Current Move Annotation */}
          <div className="bg-neutral-900 text-white rounded-2xl shadow-md p-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
             
             {isCustomMode ? (
               <div className="h-full flex flex-col justify-center items-center text-center text-neutral-400 py-8">
                 <p className="text-amber-400 font-bold mb-2">Posisi Kustom</p>
                 <p>Evaluasi mesin sedang berjalan. Analisis teks PGN dinonaktifkan untuk posisi kustom.</p>
               </div>
             ) : currentMoveIndex === -1 ? (
               <div className="h-full flex flex-col justify-center items-center text-center text-neutral-400 py-8">
                 <p>Klik "Berikutnya" atau pilih langkah di bawah untuk memulai analisis.</p>
               </div>
             ) : (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-neutral-800 text-amber-400 px-3 py-1 rounded-md text-sm font-bold border border-neutral-700">
                      Langkah {Math.floor(currentMoveIndex / 2) + 1}{currentMoveIndex % 2 === 0 ? '. ' : '... '}{history[currentMoveIndex]?.san}
                    </span>
                    {currentAnnotation?.evaluation && (
                      <span className="bg-red-900/40 text-red-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                        {currentAnnotation.evaluation}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-neutral-200 leading-relaxed text-[15px]">
                    {currentAnnotation?.annotation || "Tidak ada anotasi detail untuk langkah ini."}
                  </p>

                  {currentAnnotation?.alternatives && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Alternatif</span>
                      <p className="text-sm text-neutral-400">{currentAnnotation.alternatives}</p>
                    </div>
                  )}
               </div>
             )}
          </div>

          {/* Move List */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex-1 overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h3 className="font-bold text-neutral-800 text-sm uppercase tracking-wider">Daftar Langkah</h3>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2" ref={moveListRef}>
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
                             {pair.white.san}
                           </button>
                        </td>
                        <td className="py-2.5 px-2">
                          {pair.black && (
                            <button 
                              onClick={() => goToMove(pair.blackIndex)}
                              className={`w-full text-left px-2 py-1 rounded transition-colors ${currentMoveIndex === pair.blackIndex ? 'bg-amber-100 text-amber-900 font-bold active-move' : 'text-neutral-700 hover:bg-neutral-200'}`}
                            >
                              {pair.black.san}
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
