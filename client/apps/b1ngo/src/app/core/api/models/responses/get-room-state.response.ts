import { RoomStatus } from '../types/room-status.type';
import { SessionDto } from '../dtos/session.dto';
import { ConfigurationDto } from '../dtos/configuration.dto';
import { PlayerDto } from '../dtos/player.dto';
import { LeaderboardEntryDto } from '../dtos/leaderboard-entry.dto';

export interface GetRoomStateResponse {
  roomId: string;
  currentPlayerId: string;
  joinCode: string;
  status: RoomStatus;
  session: SessionDto;
  configuration: ConfigurationDto;
  hostPlayerId: string;
  players: PlayerDto[];
  leaderboard: LeaderboardEntryDto[];
}
