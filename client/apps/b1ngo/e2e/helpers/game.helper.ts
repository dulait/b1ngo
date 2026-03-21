import type { ApiHelper } from './api.helper';
import type { LeaderboardEntryDto } from '../../src/app/shared/types/api.types';
import { completePattern, type PatternType } from './card.helper';

export async function winGame(
  api: ApiHelper,
  roomId: string,
  playerId: string,
  playerToken: string,
  pattern: PatternType = 'row',
  index?: number,
) {
  const result = await completePattern(api, roomId, playerId, playerToken, pattern, index);
  return result;
}

export async function getLeaderboard(
  api: ApiHelper,
  roomId: string,
  playerToken: string,
): Promise<LeaderboardEntryDto[]> {
  const state = await api.getRoomState(roomId, playerToken);
  return state.leaderboard;
}
