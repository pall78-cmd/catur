import { OPENINGS_DATABASE } from '../../data/openings';

export const OPENING_BOOK = {
  e4: { eco: "B00", name: "King's Pawn Game" },
  "e4 e5": { eco: "C20", name: "Open Game" },
  "e4 e5 Nf3": { eco: "C40", name: "King's Knight Opening" },
  "e4 e5 Nf3 Nc6": { eco: "C44", name: "Open Game" },
  "e4 e5 Nf3 Nc6 Bb5": { eco: "C60", name: "Ruy Lopez" },
  "e4 e5 Nf3 Nc6 Bb5 a6": { eco: "C68", name: "Ruy Lopez, Morphy Defense" },
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4": { eco: "C70", name: "Ruy Lopez, Main Line" },
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6": { eco: "C78", name: "Ruy Lopez, Closed Defense" },
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O": { eco: "C80", name: "Ruy Lopez, Open Defense" },
  "e4 e5 Nf3 Nc6 Bc4": { eco: "C50", name: "Italian Game" },
  "e4 e5 Nf3 Nc6 Bc4 Bc5": { eco: "C50", name: "Italian Game, Giuoco Piano" },
  "e4 e5 Nf3 Nc6 Bc4 Bc5 b4": { eco: "C52", name: "Evans Gambit" },
  "e4 e5 Nf3 Nc6 Bc4 Nf6": { eco: "C55", name: "Italian Game, Two Knights Defense" },
  "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5": { eco: "C57", name: "Two Knights Defense, Fried Liver Attack" },
  "e4 e5 Nf3 Nc6 d4": { eco: "C45", name: "Scotch Game" },
  "e4 e5 Nf3 Nc6 d4 exd4 Nxd4": { eco: "C45", name: "Scotch Game" },
  "e4 e5 Nf3 Nc6 Nc3 Nf6": { eco: "C47", name: "Four Knights Game" },
  "e4 e5 Nf3 Nf6": { eco: "C42", name: "Petrov's Defense" },
  "e4 e5 Nc3": { eco: "C25", name: "Vienna Game" },
  "e4 e5 f4": { eco: "C30", name: "King's Gambit" },
  "e4 e5 f4 exf4": { eco: "C33", name: "King's Gambit Accepted" },
  "e4 c5": { eco: "B20", name: "Sicilian Defense" },
  "e4 c5 Nf3": { eco: "B27", name: "Sicilian Defense" },
  "e4 c5 Nf3 d6": { eco: "B50", name: "Sicilian Defense" },
  "e4 c5 Nf3 d6 d4": { eco: "B51", name: "Sicilian Defense, Open" },
  "e4 c5 Nf3 d6 d4 cxd4": { eco: "B52", name: "Sicilian Defense, Open" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4": { eco: "B53", name: "Sicilian Defense, Open" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6": { eco: "B54", name: "Sicilian Defense, Open" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3": { eco: "B55", name: "Sicilian Defense, Main Line" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6": { eco: "B90", name: "Sicilian Najdorf" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6": { eco: "B70", name: "Sicilian Dragon" },
  "e4 c5 Nf3 Nc6": { eco: "B30", name: "Sicilian Defense" },
  "e4 c5 c3": { eco: "B22", name: "Sicilian, Alapin Variation" },
  "e4 e6": { eco: "C00", name: "French Defense" },
  "e4 e6 d4": { eco: "C00", name: "French Defense" },
  "e4 e6 d4 d5": { eco: "C01", name: "French Defense" },
  "e4 e6 d4 d5 Nc3": { eco: "C10", name: "French Defense, Paulsen" },
  "e4 e6 d4 d5 e5": { eco: "C02", name: "French Defense, Advance" },
  "e4 c6": { eco: "B10", name: "Caro-Kann Defense" },
  "e4 c6 d4": { eco: "B12", name: "Caro-Kann Defense" },
  "e4 c6 d4 d5": { eco: "B12", name: "Caro-Kann Defense" },
  "e4 c6 d4 d5 e5": { eco: "B12", name: "Caro-Kann Defense, Advance" },
  "e4 d5": { eco: "B01", name: "Scandinavian Defense" },
  "e4 d5 exd5 Qxd5": { eco: "B01", name: "Scandinavian Defense" },
  "e4 d6": { eco: "B07", name: "Pirc Defense" },
  "e4 d6 d4 Nf6 Nc3 g6": { eco: "B07", name: "Pirc Defense" },
  "e4 g6": { eco: "B06", name: "Modern Defense" },
  "e4 Nf6": { eco: "B00", name: "Alekhine's Defense" },
  d4: { eco: "A40", name: "Queen's Pawn" },
  "d4 d5": { eco: "D00", name: "Queen's Pawn Game" },
  "d4 d5 Bf4": { eco: "A45", name: "London System" },
  "d4 d5 c4": { eco: "D06", name: "Queen's Gambit" },
  "d4 d5 c4 e6": { eco: "D30", name: "Queen's Gambit Declined" },
  "d4 d5 c4 c6": { eco: "D10", name: "Slav Defense" },
  "d4 d5 c4 dxc4": { eco: "D20", name: "Queen's Gambit Accepted" },
  "d4 Nf6": { eco: "A45", name: "Indian Defense" },
  "d4 Nf6 c4": { eco: "A50", name: "Indian Defense" },
  "d4 Nf6 c4 g6": { eco: "E60", name: "King's Indian Defense" },
  "d4 Nf6 c4 g6 Nc3 Bg7": { eco: "E60", name: "King's Indian Defense" },
  "d4 Nf6 c4 e6": { eco: "E00", name: "Indian Defense" },
  "d4 Nf6 c4 e6 g3": { eco: "E00", name: "Catalan Opening" },
  "d4 Nf6 c4 e6 Nc3 Bb4": { eco: "E20", name: "Nimzo-Indian Defense" },
  "d4 Nf6 c4 e6 Nf3 b6": { eco: "E12", name: "Queen's Indian Defense" },
  "d4 f5": { eco: "A80", name: "Dutch Defense" },
  "d4 g6": { eco: "A42", name: "Modern Defense" },
  Nf3: { eco: "A04", name: "Reti Opening" },
  "Nf3 d5": { eco: "A06", name: "Reti Opening" },
  "Nf3 Nf6": { eco: "A04", name: "Reti Opening" },
  c4: { eco: "A10", name: "English Opening" },
  "c4 e5": { eco: "A20", name: "English Opening" },
  "c4 c5": { eco: "A30", name: "English Opening, Symmetrical" },
  "c4 Nf6": { eco: "A15", name: "English Opening" },
  g3: { eco: "A00", name: "King's Fianchetto Opening" },
  b3: { eco: "A01", name: "Nimzo-Larsen Attack" },
  f4: { eco: "A02", name: "Bird's Opening" },
};

// Build high-performance lookup tree and prefix set
const BOOK_PREFIX_SET = new Set();
const BOOK_NAME_MAP = new Map();

function buildBookIndex() {
  // 1. Ingest statically defined OPENING_BOOK
  for (const [seq, data] of Object.entries(OPENING_BOOK)) {
    const moves = seq.split(' ');
    for (let i = 1; i <= moves.length; i++) {
      const prefix = moves.slice(0, i).join(' ');
      BOOK_PREFIX_SET.add(prefix);
    }
    BOOK_NAME_MAP.set(seq, data);
  }

  // 2. Ingest OPENINGS_DATABASE from openings.ts
  if (Array.isArray(OPENINGS_DATABASE)) {
    for (const op of OPENINGS_DATABASE) {
      if (!op || !Array.isArray(op.moves)) continue;
      const cleanMoves = op.moves.map(m => m.replace(/[+#?!]/g, '').trim()).filter(Boolean);
      for (let i = 1; i <= cleanMoves.length; i++) {
        const prefix = cleanMoves.slice(0, i).join(' ');
        BOOK_PREFIX_SET.add(prefix);
        if (i === cleanMoves.length) {
          BOOK_NAME_MAP.set(prefix, { eco: op.eco, name: op.name });
        }
      }
    }
  }
}

buildBookIndex();

/**
 * Normalizes input moves (string or objects) into a clean SAN string sequence
 */
export function normalizeSanHistory(sanMoves) {
  if (!sanMoves || !Array.isArray(sanMoves)) return [];
  return sanMoves
    .map(m => {
      const san = typeof m === 'string' ? m : (m?.san || '');
      return san.replace(/[+#?!]/g, '').trim();
    })
    .filter(Boolean);
}

export function findOpening(sanMoves) {
  const cleanMoves = normalizeSanHistory(sanMoves);
  if (cleanMoves.length === 0) return null;

  let best = null;
  const maxLen = Math.min(cleanMoves.length, 16);

  for (let len = 1; len <= maxLen; len++) {
    const prefix = cleanMoves.slice(0, len).join(' ');
    const entry = BOOK_NAME_MAP.get(prefix);
    if (entry) {
      best = { eco: entry.eco, name: entry.name, plyMatched: len };
    }
  }

  // If no exact named match, but move sequence is a known opening prefix, supply general category
  if (!best) {
    const fullPrefix = cleanMoves.slice(0, Math.min(cleanMoves.length, 12)).join(' ');
    if (BOOK_PREFIX_SET.has(fullPrefix)) {
      best = { eco: 'A00', name: 'Teori Pembukaan Standar', plyMatched: cleanMoves.length };
    }
  }

  return best;
}

export function isBookMove(sanMoves, moveIndex) {
  if (!sanMoves || !Array.isArray(sanMoves) || moveIndex < 0) return false;
  const cleanMoves = normalizeSanHistory(sanMoves.slice(0, moveIndex + 1));
  if (cleanMoves.length === 0) return false;

  const prefix = cleanMoves.join(' ');
  return BOOK_PREFIX_SET.has(prefix);
}

