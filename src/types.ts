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
