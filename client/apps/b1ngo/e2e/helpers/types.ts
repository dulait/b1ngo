export interface MarkSquareResult {
  row: number;
  column: number;
  isMarked: boolean;
  markedBy: string;
  markedAt: string;
  bingo: BingoInfo | null;
}

export interface BingoInfo {
  pattern: string;
  rank: number;
}

export interface UnmarkSquareResult {
  row: number;
  column: number;
  isMarked: boolean;
  markedBy: string | null;
  markedAt: string | null;
  winRevoked: boolean;
}
