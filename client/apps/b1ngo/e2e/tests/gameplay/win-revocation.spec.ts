import { test, expect } from '../../fixtures/base.fixture';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame } from '../../helpers/room.helper';
import { completePattern } from '../../helpers/card.helper';
import { getLeaderboard } from '../../helpers/game.helper';

test.describe('BNG-010: Win Revocation', () => {
  test('AC-1: unmarking a winning square revokes the win', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);

    let leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(1);

    const result = await api.unmarkSquare(
      room.roomId,
      room.host.playerId,
      0,
      1,
      room.host.playerToken,
    );
    expect(result.winRevoked).toBe(true);

    leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(0);

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const player = state.players.find((p) => p.playerId === room.host.playerId)!;
    expect(player.hasWon).toBe(false);
  });

  test('AC-4: unmarking a non-winning square preserves the win', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);

    await api.markSquare(room.roomId, room.host.playerId, 2, 0, room.host.playerToken);

    const result = await api.unmarkSquare(
      room.roomId,
      room.host.playerId,
      2,
      0,
      room.host.playerToken,
    );
    expect(result.winRevoked).toBe(false);

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(1);
  });

  test('AC-4: reranking after revocation', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 3 });
    const p1 = room.players[0];
    const p2 = room.players[1];

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await completePattern(api, room.roomId, p1.playerId, p1.playerToken, 'row', 0);
    await completePattern(api, room.roomId, p2.playerId, p2.playerToken, 'row', 0);

    await api.unmarkSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(2);
    const p1Entry = leaderboard.find((e) => e.playerId === p1.playerId)!;
    const p2Entry = leaderboard.find((e) => e.playerId === p2.playerId)!;
    expect(p1Entry.rank).toBe(1);
    expect(p2Entry.rank).toBe(2);
  });

  test('AC-7: can re-win after revocation', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await api.unmarkSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);

    let leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(0);

    await api.markSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);

    leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(1);
    expect(leaderboard[0].winningPattern).toBe('Row');
  });

  test('win revocation visible in UI', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);
    const game = new GamePage(page);
    await game.expectVisible();
    await game.expectLeaderboardEntry(1, room.host.displayName);

    await game.unmarkSquare(0, 0);
    await game.expectLeaderboardEmpty();
  });
});
