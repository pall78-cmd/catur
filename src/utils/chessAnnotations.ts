import { annotations, overview } from '../data/analysis';
import { 
  DynamicAnnotationResult, 
  EngineBestMove, 
  MoveStatsSummary, 
  MoveQualityDistribution,
  MovePairItem
} from '../types/chess';

import { cpToWinPercent, winPercentLoss } from '../lib/analysis/winPercent';
import { classifyMove, LABEL_ID } from '../lib/analysis/moveClassifier';
import { explainMove } from '../lib/analysis/explainer';
import { findMotifs } from '../lib/analysis/motifs';
import { isBookMove, findOpening } from '../lib/analysis/openingBook';

export function parseToCpAndMate(evalStr?: string): { cp: number | null, mate: number | null } {
  if (!evalStr || evalStr.includes('Mengevaluasi') || evalStr.includes('Gagal')) {
    return { cp: null, mate: null };
  }
  if (evalStr === '0.00' || evalStr === '0.0' || evalStr === '0') return { cp: 0, mate: null };
  
  const mateMatch = evalStr.match(/([+-]?)M(\d+)/i);
  if (mateMatch) {
    const sign = mateMatch[1] === '-' ? -1 : 1;
    const movesToMate = parseInt(mateMatch[2], 10) || 1;
    return { cp: null, mate: sign * movesToMate };
  }

  const cleanStr = evalStr.replace('+', '').trim();
  const num = parseFloat(cleanStr);
  return { cp: isNaN(num) ? null : Math.round(num * 100), mate: null };
}

export function parseEvalValue(evalStr?: string): number | null {
  if (!evalStr || evalStr.includes('Mengevaluasi') || evalStr === '0.00' || evalStr === '0.0') return 0;
  
  // Handle mate sequences like +M2, -M3, M1, -M1
  const mateMatch = evalStr.match(/([+-]?)M(\d+)/i);
  if (mateMatch) {
    const sign = mateMatch[1] === '-' ? -1 : 1;
    const movesToMate = parseInt(mateMatch[2], 10) || 1;
    return sign * (100 - movesToMate);
  }

  const cleanStr = evalStr.replace('+', '').trim();
  const num = parseFloat(cleanStr);
  return isNaN(num) ? null : num;
}

export function getPieceName(pieceType: string): string {
  switch (pieceType) {
    case 'p': return 'Bidak';
    case 'n': return 'Kuda';
    case 'b': return 'Gajah';
    case 'r': return 'Benteng';
    case 'q': return 'Menteri';
    case 'k': return 'Raja';
    default: return 'Perwira';
  }
}

export function getDynamicAnnotation(
  move: any,
  moveIndex: number,
  totalMoves: number,
  evalStr: string,
  bestMove: EngineBestMove | null,
  isDefaultGame: boolean,
  currentActiveMoveIndex?: number,
  perMoveEvalMap?: Record<number, { evaluation?: string; engineBestMove?: EngineBestMove | null }>
): DynamicAnnotationResult | null {
  if (moveIndex < 0 || !move) return null;
  const plyNumber = moveIndex + 1;
  const baseAnn = (isDefaultGame && annotations[plyNumber]) ? annotations[plyNumber] : null;
  const colorName = move.color === 'w' ? 'Putih' : 'Hitam';
  const isWhite = move.color === 'w';
  const pieceName = getPieceName(move.piece);
  const fromSq = move.from;
  const toSq = move.to;

  // Stockfish data for current move
  const perMoveData = perMoveEvalMap ? perMoveEvalMap[moveIndex] : undefined;
  const effectiveEvalStr = perMoveData?.evaluation || (currentActiveMoveIndex === moveIndex ? evalStr : '');
  const effectiveBestMove = perMoveData?.engineBestMove || (currentActiveMoveIndex === moveIndex ? bestMove : null);

  // Stockfish data for previous position (before this move)
  const prevMoveData = (moveIndex > 0 && perMoveEvalMap) ? perMoveEvalMap[moveIndex - 1] : undefined;
  const prevEvalStr = prevMoveData?.evaluation || (currentActiveMoveIndex === moveIndex - 1 ? evalStr : '');

  const isBest = !!(effectiveBestMove && effectiveBestMove.from === fromSq && effectiveBestMove.to === toSq);

  // Check for embedded PGN comments/annotations
  let pgnCommentAnn = '';
  let engLabel = '';
  if ((move as any).comments && Array.isArray((move as any).comments) && (move as any).comments.length > 0) {
    const commentStr = (move as any).comments.map((c: any) => c.text || c).join(' ');
    if (commentStr.includes('!!') || commentStr.toLowerCase().includes('brilliant')) { pgnCommentAnn = 'Brilian'; engLabel = 'Brilliant'; }
    else if (commentStr.includes('??') || commentStr.toLowerCase().includes('blunder')) { pgnCommentAnn = 'Blunder'; engLabel = 'Blunder'; }
    else if (commentStr.includes('!?') || commentStr.includes('?!') || commentStr.toLowerCase().includes('inaccuracy')) { pgnCommentAnn = 'Ketidakakuratan'; engLabel = 'Inaccuracy'; }
    else if (commentStr.includes('?') || commentStr.toLowerCase().includes('mistake')) { pgnCommentAnn = 'Kesalahan'; engLabel = 'Mistake'; }
    else if (commentStr.includes('!') || commentStr.toLowerCase().includes('best') || commentStr.toLowerCase().includes('great')) { pgnCommentAnn = 'Terbaik'; engLabel = 'Best'; }
  }

  // Calculate eval delta
  const currEvalVal = parseToCpAndMate(effectiveEvalStr);
  const prevEvalVal = moveIndex > 0 ? parseToCpAndMate(prevEvalStr) : { cp: 30, mate: null }; // Default start evaluation +0.3 (30cp)

  let evalLoss: number | null = null;
  let wpBefore: number | null = null;
  let wpAfter: number | null = null;

  if (currEvalVal.cp !== null || currEvalVal.mate !== null) {
    if (prevEvalVal.cp !== null || prevEvalVal.mate !== null) {
      const c1Cp = prevEvalVal.cp;
      const c1Mate = prevEvalVal.mate;
      
      const c2Cp = currEvalVal.cp;
      const c2Mate = currEvalVal.mate;

      // Calculate win percentages from the perspective of the player making the move:
      if (isWhite) {
        wpBefore = cpToWinPercent(c1Cp, c1Mate);
        wpAfter = cpToWinPercent(c2Cp, c2Mate);
      } else {
        wpBefore = 100 - cpToWinPercent(c1Cp, c1Mate);
        wpAfter = 100 - cpToWinPercent(c2Cp, c2Mate);
      }

      evalLoss = winPercentLoss(wpBefore, wpAfter);
    }
  }

  // Evaluation classification
  let evaluation: string = baseAnn?.evaluation || pgnCommentAnn || '';

  if (!evaluation) {
    const isCheck = move.san.includes('+');
    const isMate = move.san.includes('#');
    const isDraw = move.san.includes('=');
    const isMateSeq = effectiveEvalStr && effectiveEvalStr.includes('M');

    if (isMate) {
      evaluation = 'Skakmat';
    } else if (isDraw) {
      evaluation = 'Remis';
    } else if (move.isForced || (isMateSeq && isCheck && move.piece === 'k')) {
      evaluation = 'Langkah Paksaan';
    } else if (effectiveEvalStr && wpBefore !== null && wpAfter !== null) {
      const { label } = classifyMove(wpBefore, wpAfter, isBest, false);
      engLabel = label;
      evaluation = (LABEL_ID as any)[label] || label;

      // Print detailed Indonesian developer log
      console.log(`%c[CHESS ANALYZER LOG] Langkah #${moveIndex + 1} (${isWhite ? 'Putih' : 'Hitam'}): ${move.san}`, 'font-weight: bold; color: #6366f1;');
      console.log(`  - Posisi Sebelum (Langkah #${moveIndex}): ${prevEvalStr ? `"${prevEvalStr}"` : 'KOSONG (Menggunakan fallback +0.00)'} (Win%: ${wpBefore.toFixed(1)}%)`);
      console.log(`  - Posisi Sesudah (Langkah #${moveIndex + 1}): "${effectiveEvalStr}" (Win%: ${wpAfter.toFixed(1)}%)`);
      console.log(`  - Selisih Win% (winPercentLoss): ${evalLoss !== null ? `${evalLoss.toFixed(1)}%` : 'N/A'}`);
      console.log(`  - Klasifikasi: "${label}" (Translasi ID: "${evaluation}")`);
      if (!prevEvalStr && moveIndex > 0) {
        console.warn(`  [PERINGATAN] Evaluasi langkah sebelumnya kosong. winPercentLoss dihitung terhadap baseline +0.00, sehingga klasifikasi Blunder/Kesalahan mungkin tidak akurat.`);
      }
    } else if (isBest) {
      engLabel = 'Best';
      evaluation = 'Terbaik';
    } else if (move.san === 'O-O' || move.san === 'O-O-O' || move.promotion) {
      engLabel = 'Best';
      evaluation = 'Terbaik';
    } else {
      engLabel = 'Good';
      evaluation = 'Bagus';
      
      if (!isDefaultGame && effectiveEvalStr) {
        console.log(`[CHESS ANALYZER LOG] Langkah #${moveIndex + 1} (${isWhite ? 'Putih' : 'Hitam'}): ${move.san} dievaluasi "${effectiveEvalStr}" tapi kekurangan data posisi sebelumnya untuk mengukur selisih secara akurat. Default ke: "Bagus".`);
      }
    }
  }

  if (baseAnn) {
    return {
      ...baseAnn,
      evaluation
    };
  }

  // Dynamic Narrative text builder using explainer
  const annotationText = explainMove({
    moveSan: move.san,
    classification: engLabel || 'Good',
    winPercentLoss: evalLoss || 0,
    isBookMove: evaluation === 'Teori',
    openingName: null,
    motifs: [], // Without full game context in this loop, we skip deep motifs
    bestLineSan: [] 
  });

  // Alternative recommendations
  let alternatives: string | undefined = undefined;
  if (effectiveBestMove && !isBest && effectiveEvalStr && !effectiveEvalStr.includes('Mengevaluasi')) {
    alternatives = `Saran Stockfish: Menggerakkan dari ${effectiveBestMove.from} ke ${effectiveBestMove.to} dievaluasi lebih kuat untuk mendukung koordinasi (${effectiveEvalStr}).`;
  }

  return {
    evaluation,
    annotation: annotationText,
    alternatives
  };
}

export function getBadgeDetails(evaluation?: string, isCheck?: boolean, isMate?: boolean) {
  if (isMate || evaluation === 'Skakmat') {
    return { icon: '👑', label: '#', badgeClass: 'bg-amber-400 text-neutral-950 font-black shadow-amber-400/50 ring-2 ring-amber-300 animate-pulse' };
  }
  switch (evaluation) {
    case 'Remis':
      return { icon: '🤝', label: '=', badgeClass: 'bg-slate-600 text-white shadow-slate-600/50' };
    case 'Skak':
      return { icon: '⚔️', label: '+', badgeClass: 'bg-rose-600 text-white shadow-rose-600/50' };
    case 'Langkah Paksaan': 
      return { icon: '🔒', label: '!', badgeClass: 'bg-indigo-600 text-white shadow-indigo-600/50 ring-2 ring-indigo-300 animate-pulse' };
    case 'Langkah Brilian':
    case 'Brilian': 
      return { icon: '💎', label: '!!', badgeClass: 'bg-cyan-500 text-white shadow-cyan-500/50 ring-2 ring-cyan-300 animate-pulse' };
    case 'Langkah Terbaik':
    case 'Terbaik': 
      return { icon: '⭐', label: '★', badgeClass: 'bg-emerald-600 text-white shadow-emerald-600/50' };
    case 'Bagus': 
      return { icon: '👍', label: '✓', badgeClass: 'bg-green-600 text-white shadow-green-600/50' };
    case 'Teori': 
      return { icon: '📘', label: '📖', badgeClass: 'bg-blue-600 text-white shadow-blue-600/50' };
    case 'Ketidakakuratan': 
      return { icon: '⚠️', label: '?!', badgeClass: 'bg-yellow-500 text-neutral-900 shadow-yellow-500/50' };
    case 'Kesalahan': 
      return { icon: '❓', label: '?', badgeClass: 'bg-orange-600 text-white shadow-orange-600/50' };
    case 'Blunder': 
      return { icon: '💥', label: '??', badgeClass: 'bg-red-600 text-white shadow-red-600/50 ring-2 ring-red-400 animate-bounce' };
    case 'Langkah Terlewat': 
      return { icon: '✖', label: '❌', badgeClass: 'bg-purple-700 text-white shadow-purple-700/50' };
    default:
      if (isCheck) return { icon: '⚔️', label: '+', badgeClass: 'bg-rose-600 text-white shadow-rose-600/50' };
      return null;
  }
}

export function getSquareCoordinates(square: string, orientation: 'white' | 'black') {
  if (!square || square.length < 2) return null;
  const fileIndex = square.charCodeAt(0) - 97; // 0..7
  const rankIndex = parseInt(square[1], 10) - 1; // 0..7
  let col = fileIndex;
  let row = 7 - rankIndex;
  if (orientation === 'black') {
    col = 7 - fileIndex;
    row = rankIndex;
  }
  return {
    left: `${(col + 0.62) * 12.5}%`,
    top: `${(row + 0.12) * 12.5}%`,
  };
}

export function calculateMoveStats(
  history: any[],
  evaluation: string,
  engineBestMove: EngineBestMove | null,
  isDefaultGame: boolean,
  currentActiveMoveIndex?: number,
  perMoveEvalMap?: Record<number, { evaluation?: string; engineBestMove?: EngineBestMove | null }>
): MoveStatsSummary {
  const stats: MoveQualityDistribution = {
    Brilian: 0,
    Terbaik: 0,
    Bagus: 0,
    Teori: 0,
    Paksaan: 0,
    Ketidakakuratan: 0,
    Kesalahan: 0,
    Blunder: 0,
    Terlewat: 0,
  };

  const whiteStats: MoveQualityDistribution = { ...stats };
  const blackStats: MoveQualityDistribution = { ...stats };

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const isWhite = i % 2 === 0;
    const currentStats = isWhite ? whiteStats : blackStats;
    const ann = getDynamicAnnotation(
      move, 
      i, 
      history.length, 
      evaluation, 
      engineBestMove, 
      isDefaultGame,
      currentActiveMoveIndex,
      perMoveEvalMap
    );
    const evalTag = ann?.evaluation || 'Bagus';

    if (evalTag === 'Brilian' || evalTag === 'Langkah Brilian') {
      currentStats.Brilian++;
      stats.Brilian++;
    } else if (evalTag === 'Terbaik' || evalTag === 'Langkah Terbaik') {
      currentStats.Terbaik++;
      stats.Terbaik++;
    } else if (evalTag === 'Teori') {
      currentStats.Teori++;
      stats.Teori++;
    } else if (evalTag === 'Langkah Paksaan') {
      currentStats.Paksaan++;
      stats.Paksaan++;
    } else if (evalTag === 'Ketidakakuratan') {
      currentStats.Ketidakakuratan++;
      stats.Ketidakakuratan++;
    } else if (evalTag === 'Kesalahan') {
      currentStats.Kesalahan++;
      stats.Kesalahan++;
    } else if (evalTag === 'Blunder') {
      currentStats.Blunder++;
      stats.Blunder++;
    } else if (evalTag === 'Langkah Terlewat') {
      currentStats.Terlewat++;
      stats.Terlewat++;
    } else {
      currentStats.Bagus++;
      stats.Bagus++;
    }
  }

  const whiteTotal = history.filter((_, i) => i % 2 === 0).length;
  const blackTotal = history.filter((_, i) => i % 2 !== 0).length;

  const whiteGood = whiteStats.Brilian + whiteStats.Terbaik + whiteStats.Bagus + whiteStats.Teori + whiteStats.Paksaan;
  const blackGood = blackStats.Brilian + blackStats.Terbaik + blackStats.Bagus + blackStats.Teori + blackStats.Paksaan;

  const whiteAccuracy = whiteTotal > 0 ? Math.round((whiteGood / whiteTotal) * 100) : 100;
  const blackAccuracy = blackTotal > 0 ? Math.round((blackGood / blackTotal) * 100) : 100;

  return {
    totalStats: stats,
    whiteStats,
    blackStats,
    whiteAccuracy,
    blackAccuracy,
  };
}

export function generateFullPgn(
  history: any[],
  activeOverview: any,
  detectedOpening: string | null,
  isDefaultGame: boolean,
  evaluation: string,
  engineBestMove: EngineBestMove | null,
  currentActiveMoveIndex?: number,
  perMoveEvalMap?: Record<number, { evaluation?: string; engineBestMove?: EngineBestMove | null }>
): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  let pgnStr = `[Event "Analisis Catur Interaktif"]\n`;
  pgnStr += `[Site "AI Studio Chess Engine"]\n`;
  pgnStr += `[Date "${today}"]\n`;
  pgnStr += `[White "${activeOverview.white || 'Putih'}"]\n`;
  pgnStr += `[Black "${activeOverview.black || 'Hitam'}"]\n`;
  if (detectedOpening) {
    pgnStr += `[Opening "${detectedOpening}"]\n`;
  }
  pgnStr += `[Result "*"]\n\n`;

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const moveNum = Math.floor(i / 2) + 1;
    const isWhite = i % 2 === 0;

    const ann = getDynamicAnnotation(
      move, 
      i, 
      history.length, 
      evaluation, 
      engineBestMove, 
      isDefaultGame,
      currentActiveMoveIndex,
      perMoveEvalMap
    );
    const evalTag = ann?.evaluation ? `[${ann.evaluation}] ` : '';
    const noteText = ann?.annotation ? ann.annotation.replace(/[\r\n]+/g, ' ') : '';
    
    let comment = '';
    if (evalTag || noteText) {
      comment = ` { ${evalTag}${noteText} }`;
    }

    if (isWhite) {
      pgnStr += `${moveNum}. ${move.san}${comment} `;
    } else {
      pgnStr += `${move.san}${comment}\n`;
    }
  }

  return pgnStr.trim();
}
