import { SquarePositionDto } from './square-position.dto';

export interface LeaderboardEntryDto {
  rank: number;
  playerId: string;
  winningPattern: string;
  winningSquares: SquarePositionDto[];
  completedAt: string;
}
