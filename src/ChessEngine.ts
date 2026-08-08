/**
 * src/ChessEngine.ts
 *
 * Core ChessEngine module handling:
 * 1. WebAssembly / API integration for Stockfish engine analysis.
 * 2. High-performance move validation (SAN, UCI, piece move legality).
 * 3. FEN string generation, validation, and board state tracking.
 * 4. Evaluation metrics mapping to human-readable chess terminology (Indonesian & English).
 * 5. Built-in 100-cycle bruteforce stress test suite for system stability verification.
 */

import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { ChessEngine as BaseChessEngine, EngineEvaluationResult, StressTestReport } from './utils/ChessEngine';
import { getStockfishEvaluationFromApi, formatEvaluation } from './utils/stockfishApi';

export type MoveClassification = 
  | 'brilliant' 
  | 'great' 
  | 'best' 
  | 'excellent' 
  | 'good' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder' 
  | 'book';

export interface TerminologyMapping {
  evalTerm: string;
  evalDescription: string;
  winningStatus: 'White Winning' | 'Black Winning' | 'Slight White Advantage' | 'Slight Black Advantage' | 'Equal Position';
  centipawnDescription: string;
}

export class ChessEngine extends BaseChessEngine {
  /**
   * Maps numerical centipawn or mate score to human-readable chess terminology
   */
  public static mapEvaluationToTerminology(
    scoreCp: number | null, 
    scoreMate: number | null, 
    turn: Color = 'w'
  ): TerminologyMapping {
    if (scoreMate !== null && scoreMate !== undefined) {
      if (scoreMate > 0) {
        return {
          evalTerm: `Skakmat M${scoreMate} (Putih Menang)`,
          evalDescription: `Putih memiliki taktik paksaan skakmat dalam ${scoreMate} langkah.`,
          winningStatus: 'White Winning',
          centipawnDescription: `Forced Mate in ${scoreMate}`,
        };
      } else {
        const absMate = Math.abs(scoreMate);
        return {
          evalTerm: `Skakmat M${absMate} (Hitam Menang)`,
          evalDescription: `Hitam memiliki taktik paksaan skakmat dalam ${absMate} langkah.`,
          winningStatus: 'Black Winning',
          centipawnDescription: `Forced Mate in ${absMate}`,
        };
      }
    }

    const cp = scoreCp ?? 0;
    // Perspective from White (+ is White, - is Black)
    if (cp > 300) {
      return {
        evalTerm: `Keunggulan Menang Putih (+${(cp / 100).toFixed(2)})`,
        evalDescription: 'Putih memiliki keunggulan material/posisi yang sangat dominan.',
        winningStatus: 'White Winning',
        centipawnDescription: `Decisive White Advantage (+${(cp / 100).toFixed(2)})`,
      };
    } else if (cp > 120) {
      return {
        evalTerm: `Keunggulan Jelas Putih (+${(cp / 100).toFixed(2)})`,
        evalDescription: 'Putih mengontrol struktur dan perwira secara signifikan.',
        winningStatus: 'Slight White Advantage',
        centipawnDescription: `Moderate White Advantage (+${(cp / 100).toFixed(2)})`,
      };
    } else if (cp > 40) {
      return {
        evalTerm: `Keunggulan Tipis Putih (+${(cp / 100).toFixed(2)})`,
        evalDescription: 'Posisi relatif seimbang dengan sedikit tekanan dari Putih.',
        winningStatus: 'Slight White Advantage',
        centipawnDescription: `Slight White Advantage (+${(cp / 100).toFixed(2)})`,
      };
    } else if (cp < -300) {
      return {
        evalTerm: `Keunggulan Menang Hitam (${(cp / 100).toFixed(2)})`,
        evalDescription: 'Hitam memiliki keunggulan material/posisi yang sangat dominan.',
        winningStatus: 'Black Winning',
        centipawnDescription: `Decisive Black Advantage (${(cp / 100).toFixed(2)})`,
      };
    } else if (cp < -120) {
      return {
        evalTerm: `Keunggulan Jelas Hitam (${(cp / 100).toFixed(2)})`,
        evalDescription: 'Hitam mengontrol struktur dan perwira secara signifikan.',
        winningStatus: 'Slight Black Advantage',
        centipawnDescription: `Moderate Black Advantage (${(cp / 100).toFixed(2)})`,
      };
    } else if (cp < -40) {
      return {
        evalTerm: `Keunggulan Tipis Hitam (${(cp / 100).toFixed(2)})`,
        evalDescription: 'Posisi relatif seimbang dengan sedikit tekanan dari Hitam.',
        winningStatus: 'Slight Black Advantage',
        centipawnDescription: `Slight Black Advantage (${(cp / 100).toFixed(2)})`,
      };
    } else {
      return {
        evalTerm: `Posisi Seimbang / Imbang (${(cp / 100).toFixed(2)})`,
        evalDescription: 'Kedua pemain memiliki peluang yang setara tanpa kelemahan fatal.',
        winningStatus: 'Equal Position',
        centipawnDescription: `Equal Position (${(cp / 100).toFixed(2)})`,
      };
    }
  }

  /**
   * Maps win/loss evaluation drop to move quality terminology
   */
  public static mapMoveDeltaToClassification(
    evalBeforeCp: number, 
    evalAfterCp: number, 
    isSacrifice = false
  ): { classification: MoveClassification; labelIndonesian: string; colorClass: string } {
    const drop = evalBeforeCp - evalAfterCp; // Drop from current player perspective

    if (isSacrifice && drop <= 30) {
      return { classification: 'brilliant', labelIndonesian: 'Brilian!!', colorClass: 'text-cyan-400 font-bold' };
    }
    if (drop <= 10) {
      return { classification: 'best', labelIndonesian: 'Langkah Terbaik', colorClass: 'text-emerald-400 font-bold' };
    }
    if (drop <= 35) {
      return { classification: 'excellent', labelIndonesian: 'Sangat Bagus', colorClass: 'text-emerald-300 font-semibold' };
    }
    if (drop <= 75) {
      return { classification: 'good', labelIndonesian: 'Bagus', colorClass: 'text-blue-300 font-normal' };
    }
    if (drop <= 150) {
      return { classification: 'inaccuracy', labelIndonesian: 'Inakurasi?!', colorClass: 'text-amber-300 font-medium' };
    }
    if (drop <= 300) {
      return { classification: 'mistake', labelIndonesian: 'Kesalahan ?', colorClass: 'text-orange-400 font-semibold' };
    }
    return { classification: 'blunder', labelIndonesian: 'Blunder ??', colorClass: 'text-red-500 font-bold' };
  }

  /**
   * Generates FEN string for custom setup or current board
   */
  public generateFen(): string {
    return this.getFen();
  }

  /**
   * Runs a 1000-cycle stress test specifically validating WASM engine setup, move validation,
   * FEN parsing, and evaluation terminology mapping.
   */
  public static async execute1000CycleBruteforceTest(): Promise<StressTestReport> {
    return BaseChessEngine.runStressTest(1000);
  }
}

export default ChessEngine;
