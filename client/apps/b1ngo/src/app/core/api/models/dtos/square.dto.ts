import { MarkedBySource } from '../types/marked-by-source.type';

export interface SquareDto {
  row: number;
  column: number;
  displayText: string;
  eventKey: string | null;
  isFreeSpace: boolean;
  isMarked: boolean;
  markedBy: MarkedBySource | null;
  markedAt: string | null;
}
