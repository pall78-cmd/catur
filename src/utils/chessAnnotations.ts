import { annotations, overview } from '../data/analysis';
import { 
  DynamicAnnotationResult, 
  EngineBestMove, 
  MoveStatsSummary, 
  MoveQualityDistribution,
  MovePairItem
} from '../types/chess';

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
  if ((move as any).comments && Array.isArray((move as any).comments) && (move as any).comments.length > 0) {
    const commentStr = (move as any).comments.map((c: any) => c.text || c).join(' ');
    if (commentStr.includes('!!') || commentStr.toLowerCase().includes('brilliant')) pgnCommentAnn = 'Brilian';
    else if (commentStr.includes('??') || commentStr.toLowerCase().includes('blunder')) pgnCommentAnn = 'Blunder';
    else if (commentStr.includes('!?') || commentStr.includes('?!') || commentStr.toLowerCase().includes('inaccuracy')) pgnCommentAnn = 'Ketidakakuratan';
    else if (commentStr.includes('?') || commentStr.toLowerCase().includes('mistake')) pgnCommentAnn = 'Kesalahan';
    else if (commentStr.includes('!') || commentStr.toLowerCase().includes('best') || commentStr.toLowerCase().includes('great')) pgnCommentAnn = 'Terbaik';
  }

  // Calculate eval delta
  const currEvalVal = parseEvalValue(effectiveEvalStr);
  const prevEvalVal = moveIndex > 0 ? parseEvalValue(prevEvalStr) : 0.3; // Default start evaluation +0.3

  let evalLoss: number | null = null;
  let playerBeforeVal: number | null = null;
  let playerAfterVal: number | null = null;

  if (currEvalVal !== null && prevEvalVal !== null) {
    playerBeforeVal = isWhite ? prevEvalVal : -prevEvalVal;
    playerAfterVal = isWhite ? currEvalVal : -currEvalVal;
    evalLoss = playerBeforeVal - playerAfterVal;
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
      // Forced move (e.g. escaping check/mate when only 1 response exists)
      evaluation = 'Langkah Paksaan';
    } else if (move.captured) {
      const pieceVal: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
      const capVal = pieceVal[move.captured] || 1;
      const atkVal = pieceVal[move.piece] || 1;

      // Sacrifice of higher value piece or tactical sacrifice maintaining advantage
      if ((atkVal > capVal || (move.piece === 'q' && capVal < 9)) && (evalLoss !== null && evalLoss <= 0.25)) {
        evaluation = 'Brilian';
      } else if (isBest) {
        evaluation = 'Terbaik';
      } else if (evalLoss !== null && evalLoss <= 0.3) {
        evaluation = 'Bagus';
      } else if (evalLoss !== null && evalLoss >= 2.0) {
        evaluation = 'Blunder';
      } else if (evalLoss !== null && evalLoss >= 1.0) {
        evaluation = 'Kesalahan';
      } else {
        evaluation = 'Bagus';
      }
    } else if (isBest) {
      evaluation = 'Terbaik';
    } else if (move.san === 'O-O' || move.san === 'O-O-O' || move.promotion) {
      evaluation = 'Terbaik';
    } else if (moveIndex <= 12 && ['e4', 'e5', 'd4', 'd5', 'c4', 'c5', 'Nf3', 'Nf6', 'Nc3', 'Nc6', 'Bb5', 'Bc4', 'Bg5', 'Be2', 'Be3', 'Bf4', 'g6', 'e6', 'c6', 'd6', 'a6', 'b6', 'g3', 'b3', 'f4', 'Ne5', 'Ne4', 'd3'].includes(move.san)) {
      evaluation = 'Teori';
    } else if (evalLoss !== null) {
      // Missed opportunity check: Had winning position (> 2.0 pawns or mate) but lost advantage (< 0.5 pawns)
      if (playerBeforeVal !== null && playerBeforeVal >= 2.0 && playerAfterVal !== null && playerAfterVal <= 0.5) {
        evaluation = 'Langkah Terlewat';
      } else if (evalLoss >= 2.5) {
        evaluation = 'Blunder';
      } else if (evalLoss >= 1.2) {
        evaluation = 'Kesalahan';
      } else if (evalLoss >= 0.5) {
        evaluation = 'Ketidakakuratan';
      } else if (evalLoss <= 0.15) {
        evaluation = 'Terbaik';
      } else {
        evaluation = 'Bagus';
      }
    } else if (isCheck) {
      evaluation = 'Skak';
    } else {
      evaluation = 'Bagus';
    }
  }

  if (baseAnn) {
    return {
      ...baseAnn,
      evaluation
    };
  }

  // Dynamic Narrative text builder
  let annotationText = '';
  if (evaluation === 'Skakmat') {
    annotationText = `Skakmat sempurna! ${pieceName} ${colorName} mengunci Raja lawan di petak ${toSq} tanpa adanya jalan keluar. Permainan selesai!`;
  } else if (evaluation === 'Remis') {
    annotationText = `Posisi berakhir remis (${colorName} melangkah ${pieceName} ke ${toSq}). Keseimbangan material dan posisi tercapai.`;
  } else if (evaluation === 'Langkah Terlewat') {
    annotationText = `${colorName} melewatkan peluang taktis emas atau kemenangan langsung (${pieceName} ke ${toSq}). Rekomendasi Stockfish akan mempertahankan dominasi posisi secara signifikan.`;
  } else if (evaluation === 'Langkah Paksaan') {
    annotationText = `${colorName} melangkah secara terpaksa (${pieceName} ke ${toSq}) untuk merespons skak atau ancaman langsung demi keselamatan Raja.`;
  } else if (evaluation === 'Blunder') {
    annotationText = `${colorName} membuat kesalahan fatal (Blunder) dengan melangkah ${pieceName} ke ${toSq}. Langkah ini memberikan keunggulan atau taktik balasan besar bagi lawan.`;
  } else if (evaluation === 'Kesalahan') {
    annotationText = `Langkah kurang tepat (${pieceName} ke ${toSq}) oleh ${colorName}. Evaluasi posisi menurun karena melemahkan pertahanan atau kontrol petak kunci.`;
  } else if (evaluation === 'Ketidakakuratan') {
    annotationText = `Sedikit tidak akurat: ${colorName} menggeser ${pieceName} ke ${toSq}. Terdapat alternatif langkah yang lebih kokoh dalam koordinasi perwira.`;
  } else if (evaluation === 'Brilian') {
    annotationText = `Langkah Brilian! ${colorName} mengorbankan material ${pieceName} ke ${toSq} untuk membuka jalur serangan mematikan atau kombinasi taktis tingkat tinggi.`;
  } else if (move.san === 'O-O') {
    annotationText = `${colorName} melakukan rokade pendek (sisi raja) untuk mengamankan lokasi Raja ke sudut dan mempercepat mobilisasi Benteng.`;
  } else if (move.san === 'O-O-O') {
    annotationText = `${colorName} melakukan rokade panjang (sisi menteri), mengamankan Raja di petak tepi sambil menempatkan Benteng di jalur pusat.`;
  } else if (move.captured) {
    const capName = getPieceName(move.captured);
    annotationText = `${colorName} melancarkan tangkapan taktis: ${pieceName} di ${fromSq} merebut ${capName} lawan di ${toSq}.${move.san.includes('+') ? ' Disertai ancaman skak langsung!' : ''}`;
  } else if (move.san.includes('+')) {
    annotationText = `${colorName} menekan pertahanan lawan dengan skak tajam dari ${pieceName} di petak ${toSq}, memaksa pertahanan darurat.`;
  } else if (move.promotion) {
    const promName = getPieceName(move.promotion);
    annotationText = `${colorName} berhasil mendesak Bidak hingga petak ${toSq} dan mempromosikannya menjadi ${promName}.`;
  } else if (evaluation === 'Teori') {
    annotationText = `Langkah teori pembukaan standar. ${colorName} menggerakkan ${pieceName} (${fromSq} → ${toSq}) untuk mengontrol petak pusat dan mempercepat perkembangan perwira.`;
  } else if (moveIndex < 16) {
    if (move.piece === 'n' || move.piece === 'b') {
      annotationText = `${colorName} menggeser ${pieceName} dari ${fromSq} ke ${toSq} untuk mengembangkan perwira awal dan menguasai petak strategis.`;
    } else if (move.piece === 'p') {
      annotationText = `${colorName} melangkah ke ${toSq} dengan Bidak, memperkuat dominasi area pusat papan catur.`;
    } else {
      annotationText = `${colorName} memindahkan ${pieceName} ke ${toSq} untuk mengatur susunan perwira awal permainan.`;
    }
  } else if (moveIndex < 45) {
    annotationText = `${colorName} memobilisasi ${pieceName} ke ${toSq}. Langkah pertengahan yang mempertajam inisiatif serta serangan kombinasi taktis.`;
  } else {
    annotationText = `${colorName} mendorong ${pieceName} ke ${toSq} untuk memprioritaskan akselerasi bidak bebas dan posisi akhir Raja.`;
  }

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
