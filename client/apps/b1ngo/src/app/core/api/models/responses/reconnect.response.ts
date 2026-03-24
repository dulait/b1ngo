import { RoomStatus } from '../types/room-status.type';

export interface ReconnectResponse {
  roomId: string;
  playerId: string;
  roomStatus: RoomStatus;
}
