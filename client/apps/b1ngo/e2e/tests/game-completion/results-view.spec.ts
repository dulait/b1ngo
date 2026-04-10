import { test, expect } from '../../fixtures/base.fixture';
import { ResultsPage } from '../../pages/results.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame, ensureRoomStatus } from '../../helpers/room.helper';
import { completePattern } from '../../helpers/card.helper';

test.describe('BNG-012: Results View', () => {
  test('AC-1: results show leaderboard with winners', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await completePattern(api, room.roomId, player.playerId, player.playerToken, 'row', 0);
    await api.endGame(room.roomId, room.host.playerToken);
    await ensureRoomStatus(api, room.roomId, room.host.playerToken, 'Completed');

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);
    const results = new ResultsPage(page);
    await results.expectVisible();

    await results.expectLeaderboardEntry(1, room.host.displayName, 'Row');
    await results.expectLeaderboardEntry(2, player.displayName, 'Row');
  });

  test('AC-2: results with no winners shows empty leaderboard', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.endGame(room.roomId, room.host.playerToken);
    await ensureRoomStatus(api, room.roomId, room.host.playerToken, 'Completed');

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);
    const results = new ResultsPage(page);
    await results.expectVisible();
    await results.expectNoWinners();
  });

  test('AC-3: non-host non-winner sees leaderboard and own card only', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await api.endGame(room.roomId, room.host.playerToken);
    await ensureRoomStatus(api, room.roomId, room.host.playerToken, 'Completed');

    await navigateToRoom(page, context, room.roomId, player.playerId, player.playerToken);
    const results = new ResultsPage(page);
    await results.expectVisible();

    await results.expectLeaderboardEntry(1, room.host.displayName);
    await results.expectCardVisible();
    await results.expectNoRank();
  });

  test('AC-4: non-host winner sees own rank and winning squares highlighted', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    await completePattern(api, room.roomId, player.playerId, player.playerToken, 'row', 0);
    await api.endGame(room.roomId, room.host.playerToken);
    await ensureRoomStatus(api, room.roomId, room.host.playerToken, 'Completed');

    await navigateToRoom(page, context, room.roomId, player.playerId, player.playerToken);
    const results = new ResultsPage(page);
    await results.expectVisible();

    await results.expectRank(1);
    await results.expectCardVisible();
  });

  test('AC-6: cannot mark squares in Completed state via API', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.endGame(room.roomId, room.host.playerToken);

    const response = await api.markSquareRaw(
      room.roomId,
      room.host.playerId,
      0,
      0,
      room.host.playerToken,
    );
    expect(response.status()).toBe(409);
  });

  test('AC-7: leaderboard entries contain all required fields', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await api.endGame(room.roomId, room.host.playerToken);

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const entry = state.leaderboard[0];

    expect(entry.playerId).toBeDefined();
    expect(entry.rank).toBe(1);
    expect(entry.winningPattern).toBeDefined();
    expect(entry.winningSquares).toBeDefined();
    expect(entry.winningSquares.length).toBeGreaterThan(0);
    expect(entry.completedAt).toBeDefined();
    expect(entry.elapsedTime).toBeDefined();
    expect(entry.intervalToPrevious).toBeNull();
  });

  test('results view shows card section', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.markSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);
    await api.endGame(room.roomId, room.host.playerToken);
    await ensureRoomStatus(api, room.roomId, room.host.playerToken, 'Completed');

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);
    const results = new ResultsPage(page);
    await results.expectVisible();
    await results.expectCardVisible();

    await results.expectSquareMarked(0, 0);
  });
});
