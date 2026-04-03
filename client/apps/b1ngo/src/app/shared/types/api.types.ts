export type RoomStatus = 'Lobby' | 'Active' | 'Completed';
export type MarkedBySource = 'Player' | 'Host' | 'Api';
export type SessionType =
  | 'FP1'
  | 'FP2'
  | 'FP3'
  | 'Qualifying'
  | 'SprintQualifying'
  | 'Sprint'
  | 'Race';
export type WinPatternType = 'Row' | 'Column' | 'Diagonal' | 'Blackout';

export interface CreateRoomCommand {
  hostDisplayName: string;
  season: number;
  grandPrixName: string;
  sessionType: SessionType;
  matrixSize?: number;
  winningPatterns?: WinPatternType[];
}

export interface CreateRoomResponse {
  roomId: string;
  joinCode: string;
  playerId: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
  displayName: string;
}

export interface ReconnectResponse {
  roomId: string;
  playerId: string;
  roomStatus: RoomStatus;
}

export interface ReferenceDataResponse {
  seasons: number[];
  grandPrix: GrandPrixOption[];
}

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

export interface GrandPrixOption {
  name: string;
  season: number;
  round: number;
  isSprint: boolean;
  sessionTypes: string[];
}

export interface SessionDto {
  season: number;
  grandPrixName: string;
  sessionType: string;
}

export interface ConfigurationDto {
  matrixSize: number;
  winningPatterns: WinPatternType[];
}

export interface PlayerDto {
  playerId: string;
  displayName: string;
  hasWon: boolean;
  card: CardDto | null;
}

export interface CardDto {
  matrixSize: number;
  squares: SquareDto[];
}

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

export interface SquarePositionDto {
  row: number;
  column: number;
}

export interface LeaderboardEntryDto {
  rank: number;
  playerId: string;
  winningPattern: string;
  winningSquares: SquarePositionDto[];
  completedAt: string;
}
