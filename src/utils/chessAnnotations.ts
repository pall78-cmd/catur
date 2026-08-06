import { annotations, overview } from '../data/analysis';
import { 
  DynamicAnnotationResult, 
  EngineBestMove, 
  MoveStatsSummary, 
  MoveQualityDistribution,
  MovePairItem
} from '../types/chess';

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
  isDefaultGame: boolean
): DynamicAnnotationResult | null {
  if (moveIndex < 0 || !move) return null;
  const plyNumber = moveIndex + 1;
  const baseAnn = (isDefaultGame && annotations[plyNumber]) ? annotations[plyNumber] : null;
  const colorName = move.color === 'w' ? 'Putih' : 'Hitam';
  const pieceName = getPieceName(move.piece);
  const fromSq = move.from;
  const toSq = move.to;
  const isBest = bestMove && bestMove.from === fromSq && bestMove.to === toSq;

  // Evaluation classification
  let evaluation: string = baseAnn?.evaluation || '';

  if (!evaluation) {
    const isCheck = move.san.includes('+');
    const isMate = move.san.includes('#');
    const isMateSeq = evalStr && evalStr.includes('M');

    if (isMate) {
      evaluation = 'Skakmat';
    } else if (move.piece === 'k' && (isCheck || isMateSeq)) {
      evaluation = 'Langkah Paksaan';
    } else if (isMateSeq && isCheck) {
      evaluation = 'Langkah Paksaan';
    } else if (isBest) {
      if (move.captured && (move.piece === 'q' || move.piece === 'r' || move.piece === 'b' || isCheck)) {
        evaluation = 'Brilian';
      } else {
        evaluation = 'Terbaik';
      }
    } else if (move.captured && (move.san.includes('+') || move.piece === 'q')) {
      evaluation = 'Terbaik';
    } else if (moveIndex <= 3) {
      evaluation = 'Teori';
    } else if (evalStr && !evalStr.includes('Mengevaluasi')) {
      const num = parseFloat(evalStr.replace('+', ''));
      if ((move.color === 'w' && num > 2.5) || (move.color === 'b' && num < -2.5)) {
        evaluation = 'Terbaik';
      } else if ((move.color === 'w' && num < -3.5) || (move.color === 'b' && num > 3.5)) {
        evaluation = 'Blunder';
      } else if ((move.color === 'w' && num < -1.8) || (move.color === 'b' && num > 1.8)) {
        evaluation = 'Kesalahan';
      } else if ((move.color === 'w' && num < -0.8) || (move.color === 'b' && num > 0.8)) {
        evaluation = 'Ketidakakuratan';
      } else {
        evaluation = 'Bagus';
      }
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

  // Narrative builder
  let annotationText = '';
  if (evaluation === 'Langkah Paksaan') {
    annotationText = `${colorName} melangkah secara terpaksa (${pieceName} ke ${toSq}) untuk merespons skak atau ancaman skakmat langsung demi keselamatan Raja!`;
  } else if (move.san === 'O-O') {
    annotationText = `${colorName} melakukan rokade pendek (sisi raja) untuk mengamankan lokasi Raja dan mempercepat mobilisasi Benteng.`;
  } else if (move.san === 'O-O-O') {
    annotationText = `${colorName} melakukan rokade panjang (sisi menteri), mengamankan Raja di petak tepi sambil menempatkan Benteng langsung di jalur terbuka pusat.`;
  } else if (move.san.includes('#')) {
    annotationText = `Skakmat sempurna! ${pieceName} ${colorName} mengunci Raja lawan di petak ${toSq} tanpa adanya jalan keluar.`;
  } else if (move.captured) {
    const capName = getPieceName(move.captured);
    annotationText = `${colorName} melancarkan tangkapan taktis: ${pieceName} di ${fromSq} merebut ${capName} lawan di ${toSq}.${move.san.includes('+') ? ' Disertai ancaman skak langsung!' : ''}`;
  } else if (move.san.includes('+')) {
    annotationText = `${colorName} menekan pertahanan lawan dengan skak dari ${pieceName} di petak ${toSq}, memaksa pertahanan darurat.`;
  } else if (move.promotion) {
    const promName = getPieceName(move.promotion);
    annotationText = `${colorName} berhasil mendesak Bidak hingga petak ${toSq} dan mempromosikannya menjadi ${promName}.`;
  } else if (moveIndex < 16) {
    if (move.piece === 'n' || move.piece === 'b') {
      annotationText = `${colorName} menggeser ${pieceName} dari ${fromSq} ke ${toSq} untuk mengembangkan perwira awal dan menguasai petak strategis.`;
    } else if (move.piece === 'p') {
      annotationText = `${colorName} melangkah ke ${toSq} dengan Bidak, memperkuat dominasi area pusat board.`;
    } else {
      annotationText = `${colorName} memindahkan ${pieceName} ke ${toSq} untuk posisi awal permainan.`;
    }
  } else if (moveIndex < 45) {
    annotationText = `${colorName} memobilisasi ${pieceName} ke ${toSq}. Langkah pertengahan yang mempertajam inisiatif serta serangan kombinasi.`;
  } else {
    annotationText = `${colorName} mendorong ${pieceName} ke ${toSq} untuk memprioritaskan akselerasi bidak bebas dan posisi akhir Raja.`;
  }

  // Alternative recommendations
  let alternatives: string | undefined = undefined;
  if (bestMove && !isBest && !evalStr.includes('Mengevaluasi')) {
    alternatives = `Saran Stockfish: Menggerakkan dari ${bestMove.from} ke ${bestMove.to} dievaluasi lebih kuat untuk mendukung koordinasi (${evalStr}).`;
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
  isDefaultGame: boolean
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
  };

  const whiteStats: MoveQualityDistribution = { ...stats };
  const blackStats: MoveQualityDistribution = { ...stats };

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const isWhite = i % 2 === 0;
    const currentStats = isWhite ? whiteStats : blackStats;
    const ann = getDynamicAnnotation(move, i, history.length, evaluation, engineBestMove, isDefaultGame);
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
  engineBestMove: EngineBestMove | null
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

    const ann = getDynamicAnnotation(move, i, history.length, evaluation, engineBestMove, isDefaultGame);
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
