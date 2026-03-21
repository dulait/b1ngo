import type { ApiHelper } from './api.helper';
import type { CreateRoomCommand, RoomStatus, WinPatternType } from '../../src/app/shared/types/api.types';

export interface PlayerContext {
  playerId: string;
  playerToken: string;
  displayName: string;
}

export interface ActiveGameContext {
  roomId: string;
  joinCode: string;
  host: PlayerContext;
  players: PlayerContext[];
}

export async function setupActiveGame(
  api: ApiHelper,
  options?: {
    matrixSize?: number;
    playerCount?: number;
    winningPatterns?: WinPatternType[];
    hostDisplayName?: string;
  },
): Promise<ActiveGameContext> {
  const playerCount = options?.playerCount ?? 1;
  const hostName = options?.hostDisplayName ?? `Host_${Date.now()}`;

  const createOpts: Partial<CreateRoomCommand> = {
    hostDisplayName: hostName,
  };
  if (options?.matrixSize) {createOpts.matrixSize = options.matrixSize;}
  if (options?.winningPatterns) {createOpts.winningPatterns = options.winningPatterns;}

  const room = await api.createRoom(createOpts);

  const host: PlayerContext = {
    playerId: room.playerId,
    playerToken: room.playerToken,
    displayName: hostName,
  };

  const players: PlayerContext[] = [];
  for (let i = 1; i < playerCount; i++) {
    const name = `Player${i}_${Date.now()}`;
    const joined = await api.joinRoom(room.joinCode, name);
    players.push({
      playerId: joined.playerId,
      playerToken: joined.playerToken,
      displayName: name,
    });
  }

  await api.startGame(room.roomId, room.playerToken);

  return {
    roomId: room.roomId,
    joinCode: room.joinCode,
    host,
    players,
  };
}

export async function setupLobbyRoom(
  api: ApiHelper,
  options?: {
    matrixSize?: number;
    playerCount?: number;
    winningPatterns?: WinPatternType[];
    hostDisplayName?: string;
  },
): Promise<ActiveGameContext> {
  const playerCount = options?.playerCount ?? 1;
  const hostName = options?.hostDisplayName ?? `Host_${Date.now()}`;

  const createOpts: Partial<CreateRoomCommand> = {
    hostDisplayName: hostName,
  };
  if (options?.matrixSize) {createOpts.matrixSize = options.matrixSize;}
  if (options?.winningPatterns) {createOpts.winningPatterns = options.winningPatterns;}

  const room = await api.createRoom(createOpts);

  const host: PlayerContext = {
    playerId: room.playerId,
    playerToken: room.playerToken,
    displayName: hostName,
  };

  const players: PlayerContext[] = [];
  for (let i = 1; i < playerCount; i++) {
    const name = `Player${i}_${Date.now()}`;
    const joined = await api.joinRoom(room.joinCode, name);
    players.push({
      playerId: joined.playerId,
      playerToken: joined.playerToken,
      displayName: name,
    });
  }

  return {
    roomId: room.roomId,
    joinCode: room.joinCode,
    host,
    players,
  };
}

export async function ensureRoomStatus(
  api: ApiHelper,
  roomId: string,
  playerToken: string,
  expectedStatus: RoomStatus,
  maxAttempts = 10,
  delayMs = 200,
) {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await api.getRoomState(roomId, playerToken);
    if (state.status === expectedStatus) return;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Room did not reach '${expectedStatus}' status within ${maxAttempts * delayMs}ms`);
}
