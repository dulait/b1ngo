import { MarkedBySource } from '../../api/models/types/marked-by-source.type';

export interface SquareMarkedEvent {
  playerId: string;
  row: number;
  column: number;
  markedBy: MarkedBySource;
  markedAt: string;
  correlationId?: string;
}
