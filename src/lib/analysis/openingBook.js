export const OPENING_BOOK = {
  e4: { eco: "B00", name: "King's Pawn" },
  "e4 e5": { eco: "C20", name: "Open Game" },
  "e4 e5 Nf3": { eco: "C40", name: "King's Knight Opening" },
  "e4 e5 Nf3 Nc6": { eco: "C44", name: "Open Game" },
  "e4 e5 Nf3 Nc6 Bb5": { eco: "C60", name: "Ruy Lopez" },
  "e4 e5 Nf3 Nc6 Bb5 a6": { eco: "C68", name: "Ruy Lopez, Morphy Defense" },
  "e4 e5 Nf3 Nc6 Bc4": { eco: "C50", name: "Italian Game" },
  "e4 e5 Nf3 Nc6 Bc4 Bc5": {
    eco: "C50",
    name: "Italian Game, Giuoco Piano",
  },
  "e4 e5 Nf3 Nc6 Bc4 Nf6": {
    eco: "C55",
    name: "Italian Game, Two Knights Defense",
  },
  "e4 e5 Nf3 Nf6": { eco: "C42", name: "Petrov's Defense" },
  "e4 e5 Nc3": { eco: "C25", name: "Vienna Game" },
  "e4 e5 f4": { eco: "C30", name: "King's Gambit" },
  "e4 c5": { eco: "B20", name: "Sicilian Defense" },
  "e4 c5 Nf3": { eco: "B27", name: "Sicilian Defense" },
  "e4 c5 Nf3 d6": { eco: "B50", name: "Sicilian Defense" },
  "e4 c5 Nf3 Nc6": { eco: "B30", name: "Sicilian Defense" },
  "e4 c5 c3": { eco: "B22", name: "Sicilian, Alapin Variation" },
  "e4 e6": { eco: "C00", name: "French Defense" },
  "e4 e6 d4 d5": { eco: "C01", name: "French Defense" },
  "e4 c6": { eco: "B10", name: "Caro-Kann Defense" },
  "e4 c6 d4 d5": { eco: "B12", name: "Caro-Kann Defense" },
  "e4 d5": { eco: "B01", name: "Scandinavian Defense" },
  "e4 d6": { eco: "B07", name: "Pirc Defense" },
  "e4 g6": { eco: "B06", name: "Modern Defense" },
  "e4 Nf6": { eco: "B00", name: "Alekhine's Defense" },
  d4: { eco: "A40", name: "Queen's Pawn" },
  "d4 d5": { eco: "D00", name: "Queen's Pawn Game" },
  "d4 d5 c4": { eco: "D06", name: "Queen's Gambit" },
  "d4 d5 c4 e6": { eco: "D30", name: "Queen's Gambit Declined" },
  "d4 d5 c4 c6": { eco: "D10", name: "Slav Defense" },
  "d4 d5 c4 dxc4": { eco: "D20", name: "Queen's Gambit Accepted" },
  "d4 Nf6": { eco: "A45", name: "Indian Defense" },
  "d4 Nf6 c4": { eco: "A50", name: "Indian Defense" },
  "d4 Nf6 c4 g6": { eco: "E60", name: "King's Indian Defense" },
  "d4 Nf6 c4 e6": { eco: "E00", name: "Indian Defense" },
  "d4 Nf6 c4 e6 Nc3 Bb4": { eco: "E20", name: "Nimzo-Indian Defense" },
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

export function findOpening(sanMoves) {
  if (!sanMoves || sanMoves.length === 0) return null;
  // Clean SAN moves of annotations
  const cleanMoves = sanMoves.map(m => m.replace(/[+#?!]/g, '').trim());
  let best = null;
  const maxLen = Math.min(cleanMoves.length, 12);

  for (let len = 1; len <= maxLen; len++) {
    const prefix = cleanMoves.slice(0, len).join(" ");
    const entry = OPENING_BOOK[prefix];
    if (entry) {
      best = { eco: entry.eco, name: entry.name, plyMatched: len };
    }
  }

  return best;
}

export function isBookMove(sanMoves, moveIndex) {
  const prefixAfter = sanMoves.slice(0, moveIndex + 1);
  const match = findOpening(prefixAfter);
  return match !== null && match.plyMatched === moveIndex + 1;
}
