import { Chess } from "chess.js";
import { cpToWinPercent, winPercentLoss, moveAccuracy } from "./winPercent.js";
import { classifyMove } from "./moveClassifier.js";
import { isBookMove, findOpening } from "./openingBook.js";
import { findMotifs } from "./motifs.js";
import { explainMove } from "./explainer.js";
import { pvToSan } from "./stockfishEngine.js";

export async function analyzeGame(pgn, analyzer, { depth = 20, onProgress } = {}) {
  const parser = new Chess();
  parser.loadPgn(pgn);
  const verboseHistory = parser.history({ verbose: true });

  const chess = new Chess();
  const sanMovesSoFar = [];
  const moveAnalyses = [];

  const whiteLosses = [];
  const blackLosses = [];
  const whiteCounts = { Blunder: 0, Mistake: 0, Inaccuracy: 0 };
  const blackCounts = { Blunder: 0, Mistake: 0, Inaccuracy: 0 };

  analyzer.newGame();

  let fenBeforeMove = chess.fen();
  let evalBeforeLines = await analyzer.analyzePosition(fenBeforeMove, { depth });
  let evalBefore = evalBeforeLines ? evalBeforeLines[0] : null;

  for (let i = 0; i < verboseHistory.length; i++) {
    const moveInfo = verboseHistory[i];
    const isWhite = chess.turn() === "w";
    const moveNumber = Math.floor(i / 2) + 1;

    chess.move({
      from: moveInfo.from,
      to: moveInfo.to,
      promotion: moveInfo.promotion,
    });
    sanMovesSoFar.push(moveInfo.san);
    const fenAfterMove = chess.fen();

    const evalAfterLines = await analyzer.analyzePosition(fenAfterMove, {
      depth,
    });
    const evalAfter = evalAfterLines ? evalAfterLines[0] : null;

    const wpBefore = cpToWinPercent(evalBefore?.scoreCp, evalBefore?.scoreMate);
    const wpAfterOpponentView = cpToWinPercent(
      evalAfter?.scoreCp,
      evalAfter?.scoreMate
    );
    const wpAfter = 100 - wpAfterOpponentView;

    const loss = winPercentLoss(wpBefore, wpAfter);

    const moveIndex = sanMovesSoFar.length - 1;
    const book = isBookMove(sanMovesSoFar, moveIndex);
    const openingMatch = findOpening(sanMovesSoFar);

    const playedUci = `${moveInfo.from}${moveInfo.to}${moveInfo.promotion || ""}`;
    const isBest = evalBefore?.pv?.[0] === playedUci;

    const { label: classification } = classifyMove(
      wpBefore,
      wpAfter,
      isBest,
      book
    );

    const motifs = findMotifs(chess, moveInfo.to, isWhite ? "w" : "b");

    const bestLineSan =
      evalBefore && evalBefore.pv && evalBefore.pv.length > 0
        ? pvToSan(chess, fenBeforeMove, evalBefore.pv, 4)
        : [];

    const explanation = explainMove({
      moveSan: moveInfo.san,
      classification,
      winPercentLoss: loss,
      isBookMove: book,
      openingName: openingMatch ? openingMatch.name : null,
      motifs,
      bestLineSan,
    });

    // Format evaluation string (from White's perspective)
    let scoreStr = "0.00";
    if (evalAfter) {
      const turnAfterMove = chess.turn();
      if (evalAfter.scoreMate !== null && evalAfter.scoreMate !== undefined) {
        const mateVal = turnAfterMove === 'w' ? evalAfter.scoreMate : -evalAfter.scoreMate;
        scoreStr = mateVal > 0 ? `+M${Math.abs(mateVal)}` : `-M${Math.abs(mateVal)}`;
      } else if (evalAfter.scoreCp !== null && evalAfter.scoreCp !== undefined) {
        const cpVal = turnAfterMove === 'w' ? (evalAfter.scoreCp / 100) : -(evalAfter.scoreCp / 100);
        scoreStr = cpVal > 0 ? `+${cpVal.toFixed(2)}` : cpVal.toFixed(2);
      }
    }

    let engineBestMove = null;
    if (evalBefore && evalBefore.pv && evalBefore.pv.length > 0) {
      const uci = evalBefore.pv[0];
      engineBestMove = {
        from: uci.substring(0, 2),
        to: uci.substring(2, 4),
      };
    }

    moveAnalyses.push({
      moveNumber,
      isWhite,
      moveSan: moveInfo.san,
      fen: fenAfterMove,
      classification,
      winPercentBefore: wpBefore,
      winPercentAfter: wpAfter,
      winPercentLoss: loss,
      isBookMove: book,
      openingName: openingMatch ? openingMatch.name : null,
      motifs,
      bestLineSan,
      explanation,
      evaluation: scoreStr,
      engineBestMove,
    });

    if (["Blunder", "Mistake", "Inaccuracy"].includes(classification)) {
      const counts = isWhite ? whiteCounts : blackCounts;
      counts[classification]++;
    }
    (isWhite ? whiteLosses : blackLosses).push(loss);

    if (onProgress) onProgress(i + 1, verboseHistory.length);

    fenBeforeMove = fenAfterMove;
    evalBefore = evalAfter;
  }

  const avg = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const whiteAccuracy = whiteLosses.length
    ? avg(whiteLosses.map(moveAccuracy))
    : 100;
  const blackAccuracy = blackLosses.length
    ? avg(blackLosses.map(moveAccuracy))
    : 100;

  return {
    moves: moveAnalyses,
    whiteAccuracy,
    blackAccuracy,
    whiteBlunders: whiteCounts.Blunder,
    whiteMistakes: whiteCounts.Mistake,
    whiteInaccuracies: whiteCounts.Inaccuracy,
    blackBlunders: blackCounts.Blunder,
    blackMistakes: blackCounts.Mistake,
    blackInaccuracies: blackCounts.Inaccuracy,
  };
}
