// --- Enums as union types (matching .NET JsonStringEnumConverter camelCase) ---

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
export type WinPatternType = 'Row' | 'Column' | 'Diagonal' | 'Corners' | 'Blackout';

// --- API Request Commands ---

export interface CreateRoomCommand {
  hostDisplayName: string;
  season: string;
  grandPrixName: string;
  sessionType: SessionType;
  matrixSize?: number;
  winningPatterns?: WinPatternType[];
}

export interface JoinRoomCommand {
  joinCode: string;
  displayName: string;
}

// --- API Responses ---

export interface CreateRoomResponse {
  roomId: string;
  joinCode: string;
  playerId: string;
  playerToken: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
  playerToken: string;
  displayName: string;
}

export interface ReconnectResponse {
  roomId: string;
  playerId: string;
  roomStatus: RoomStatus;
}

export interface GetRoomStateResponse {
  roomId: string;
  joinCode: string;
  status: RoomStatus;
  session: SessionDto;
  configuration: ConfigurationDto;
  hostPlayerId: string;
  players: PlayerDto[];
  leaderboard: LeaderboardEntryDto[];
}

// --- DTOs ---

export interface SessionDto {
  season: string;
  grandPrixName: string;
  grandPrixShort: string;
  sessionType: string;
}

export interface ConfigurationDto {
  matrixSize: number;
  winningPatterns: WinPatternType[];
}

export interface PlayerDto {
  id: string;
  displayName: string;
  isHost: boolean;
  card: CardDto | null;
}

export interface CardDto {
  squares: SquareDto[];
}

export interface SquareDto {
  row: number;
  column: number;
  displayText: string;
  isFreeSpace: boolean;
  isMarked: boolean;
  markedBy: MarkedBySource | null;
  markedAt: string | null;
}

export interface LeaderboardEntryDto {
  rank: number;
  playerId: string;
  displayName: string;
  pattern: string;
  completedAt: string;
}

// --- SignalR Event Payloads ---

export interface PlayerJoinedEvent {
  player: PlayerDto;
}

export interface GameStartedEvent {
  startedAt: string;
}

export interface SquareMarkedEvent {
  playerId: string;
  row: number;
  column: number;
  markedBy: MarkedBySource;
  markedAt: string;
}

export interface SquareUnmarkedEvent {
  playerId: string;
  row: number;
  column: number;
}

export interface BingoAchievedEvent {
  playerId: string;
  displayName: string;
  pattern: string;
  leaderboard: LeaderboardEntryDto[];
}

export interface GameCompletedEvent {
  leaderboard: LeaderboardEntryDto[];
  completedAt: string;
}
