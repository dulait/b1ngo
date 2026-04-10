import { SquarePositionDto } from '../../api/models/dtos/square-position.dto';

export interface BingoAchievedEvent {
  playerId: string;
  pattern: string;
  winningSquares: SquarePositionDto[];
  rank: number;
  completedAt: string;
  elapsedTime: string;
  intervalToPrevious: string | null;
}
