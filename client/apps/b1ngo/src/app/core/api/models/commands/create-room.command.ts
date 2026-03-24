import { SessionType } from '../types/session-type.type';
import { WinPatternType } from '../types/win-pattern-type.type';

export interface CreateRoomCommand {
  hostDisplayName: string;
  season: number;
  grandPrixName: string;
  sessionType: SessionType;
  matrixSize?: number;
  winningPatterns?: WinPatternType[];
}
