const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function allSquares() {
  const squares = [];
  for (const file of FILES) {
    for (let rank = 1; rank <= 8; rank++) squares.push(`${file}${rank}`);
  }
  return squares;
}

function oppositeColor(color) {
  return color === "w" ? "b" : "w";
}

function findKingSquare(chess, color) {
  for (const sq of allSquares()) {
    const piece = chess.get(sq);
    if (piece && piece.type === "k" && piece.color === color) return sq;
  }
  return null;
}

export function isPinned(chess, square) {
  const piece = chess.get(square);
  if (!piece || piece.type === "k") return false;

  const kingSquare = findKingSquare(chess, piece.color);
  if (!kingSquare) return false;

  const enemyColor = oppositeColor(piece.color);

  if (chess.isAttacked(kingSquare, enemyColor)) return false;

  let exposedAfterRemoval = false;
  chess.remove(square);
  try {
    exposedAfterRemoval = chess.isAttacked(kingSquare, enemyColor);
  } finally {
    chess.put(piece, square);
  }

  return exposedAfterRemoval;
}

export function detectPins(chess, color) {
  const pinned = [];
  for (const sq of allSquares()) {
    const piece = chess.get(sq);
    if (piece && piece.color === color && piece.type !== "k") {
      if (isPinned(chess, sq)) pinned.push(sq);
    }
  }
  return pinned;
}

export function detectHangingPieces(chess, color) {
  const enemyColor = oppositeColor(color);
  const hanging = [];
  for (const sq of allSquares()) {
    const piece = chess.get(sq);
    if (piece && piece.color === color) {
      const attacked = chess.isAttacked(sq, enemyColor);
      const defended = chess.isAttacked(sq, color);
      if (attacked && !defended) hanging.push(sq);
    }
  }
  return hanging;
}

function getAttackedSquares(chess, square) {
  const piece = chess.get(square);
  if (!piece) return [];

  const originalFen = chess.fen();
  const fenParts = originalFen.split(" ");
  const currentTurn = fenParts[1];

  let targets = [];
  try {
    if (currentTurn !== piece.color) {
      fenParts[1] = piece.color;
      chess.load(fenParts.join(" "));
    }

    const moves = chess.moves({ square, verbose: true });
    targets = moves.map((m) => m.to);
  } catch (e) {
    targets = [];
  } finally {
    try {
      chess.load(originalFen);
    } catch (e) {}
  }

  return targets;
}

export function detectFork(chess, toSquare) {
  const piece = chess.get(toSquare);
  if (!piece) return false;

  const enemyColor = oppositeColor(piece.color);
  const attacked = getAttackedSquares(chess, toSquare);

  let targetCount = 0;
  for (const sq of attacked) {
    const target = chess.get(sq);
    if (target && target.color === enemyColor) targetCount++;
  }

  return targetCount >= 2;
}

export function findMotifs(chess, toSquare, moverColor) {
  const motifs = [];
  const opponentColor = oppositeColor(moverColor);

  if (detectFork(chess, toSquare)) motifs.push("fork");

  const newlyHanging = detectHangingPieces(chess, opponentColor);
  if (newlyHanging.length > 0) motifs.push("hanging_piece_created");

  const ownHanging = detectHangingPieces(chess, moverColor);
  if (ownHanging.length > 0) motifs.push("left_piece_hanging");

  if (chess.isCheck ? chess.isCheck() : chess.inCheck()) {
    motifs.push("check");
  }

  return motifs;
}
