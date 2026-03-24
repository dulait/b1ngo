import { CardDto } from './card.dto';

export interface PlayerDto {
  playerId: string;
  displayName: string;
  hasWon: boolean;
  card: CardDto | null;
}
