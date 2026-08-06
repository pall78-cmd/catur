export interface MoveAnalysis {
  ply: number;
  whiteMove?: string;
  blackMove?: string;
  annotation: string;
  alternatives?: string;
  evaluation?: string;
}

export interface GameOverview {
  title: string;
  white: string;
  black: string;
  result: string;
  evaluation: string;
}

export interface EngineBestMove {
  from: string;
  to: string;
}

export type MoveEvaluationType =
  | 'Brilian'
  | 'Langkah Brilian'
  | 'Terbaik'
  | 'Langkah Terbaik'
  | 'Bagus'
  | 'Teori'
  | 'Langkah Paksaan'
  | 'Ketidakakuratan'
  | 'Kesalahan'
  | 'Blunder'
  | 'Skakmat'
  | 'Langkah Terlewat';

export interface DynamicAnnotationResult {
  evaluation: string;
  annotation: string;
  alternatives?: string;
}

export interface MoveQualityDistribution {
  Brilian: number;
  Terbaik: number;
  Bagus: number;
  Teori: number;
  Paksaan: number;
  Ketidakakuratan: number;
  Kesalahan: number;
  Blunder: number;
  Terlewat: number;
}

export interface MoveStatsSummary {
  totalStats: MoveQualityDistribution;
  whiteStats: MoveQualityDistribution;
  blackStats: MoveQualityDistribution;
  whiteAccuracy: number;
  blackAccuracy: number;
}

export interface MovePairItem {
  moveNumber: number;
  white: any;
  black?: any;
  whiteIndex: number;
  blackIndex?: number;
  whiteEval: string;
  blackEval?: string;
}

export interface InteractiveTrial {
  move: any;
  fen: string;
}
