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

// --- Reference Data ---

export interface ReferenceDataResponse {
  seasons: number[];
  grandPrix: GrandPrixOption[];
}

export interface GrandPrixOption {
  name: string;
  season: number;
  round: number;
  isSprint: boolean;
  sessionTypes: string[];
}

// --- API Request Commands ---

export interface CreateRoomCommand {
  hostDisplayName: string;
  season: number;
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

// --- SignalR Event Payloads ---

export interface PlayerJoinedEvent {
  playerId: string;
  displayName: string;
}

export interface GameStartedEvent {
  roomId: string;
}

export interface SquareMarkedEvent {
  playerId: string;
  row: number;
  column: number;
  markedBy: MarkedBySource;
  markedAt: string;
  correlationId?: string;
}

export interface SquareUnmarkedEvent {
  playerId: string;
  row: number;
  column: number;
  correlationId?: string;
}

export interface BingoAchievedEvent {
  playerId: string;
  pattern: string;
  winningSquares: SquarePositionDto[];
  rank: number;
  completedAt: string;
}

export interface BingoRevokedEvent {
  playerId: string;
}

export interface GameCompletedEvent {
  roomId: string;
}
