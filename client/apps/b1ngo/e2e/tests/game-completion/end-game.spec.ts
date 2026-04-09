import { test, expect } from '../../fixtures/base.fixture';
import { multiPlayerTest } from '../../fixtures/multi-player.fixture';
import { GamePage } from '../../pages/game.page';
import { ResultsPage } from '../../pages/results.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame } from '../../helpers/room.helper';
import { completePattern } from '../../helpers/card.helper';
import { getLeaderboard } from '../../helpers/game.helper';

test.describe('BNG-011: End Game', () => {
  test('AC-1: host ending the game transitions room to Completed', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await api.endGame(room.roomId, room.host.playerToken);

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    expect(state.status).toBe('Completed');
  });

  test('AC-2: ending game with no winners results in empty leaderboard', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await api.endGame(room.roomId, room.host.playerToken);

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(0);
  });

  test('AC-3: ending game with multiple winners preserves leaderboard', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 3 });
    const p1 = room.players[0];

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await completePattern(api, room.roomId, p1.playerId, p1.playerToken, 'row', 0);

    await api.endGame(room.roomId, room.host.playerToken);

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].playerId).toBe(room.host.playerId);
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].playerId).toBe(p1.playerId);
  });

  test('ERR-2: non-host cannot end game', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    const response = await api.endGameRaw(room.roomId, player.playerToken);
    expect(response.status()).toBe(403);
  });

  test('ERR-5: cannot end game when room is in Lobby', async ({ api }) => {
    const room = await api.createRoom({ matrixSize: 3 });

    const response = await api.endGameRaw(room.roomId, room.playerToken);
    expect(response.status()).toBe(409);
  });

  test('ERR-5: cannot end game when already Completed', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.endGame(room.roomId, room.host.playerToken);

    const response = await api.endGameRaw(room.roomId, room.host.playerToken);
    expect(response.status()).toBe(409);
  });

  test('no marks or unmarks allowed after game ends', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.endGame(room.roomId, room.host.playerToken);

    const markResponse = await api.markSquareRaw(
      room.roomId,
      room.host.playerId,
      0,
      0,
      room.host.playerToken,
    );
    expect(markResponse.status()).toBe(409);
  });

  test('end game visible in UI with confirmation', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();
    await game.expectEndGameVisible();

    await game.endGame();

    const results = new ResultsPage(page);
    await results.expectVisible();
  });
});

multiPlayerTest.describe('BNG-011: End Game / Real-Time', () => {
  multiPlayerTest(
    'RT-1: all connected players see transition to results view',
    async ({ browser, api }) => {
      const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
      const player = room.players[0];

      const playerCtx = await browser.newContext({ ignoreHTTPSErrors: true });
      const playerPage = await playerCtx.newPage();

      const wsReady = playerPage
        .waitForEvent('websocket')
        .then((ws) => ws.waitForEvent('framereceived'));

      await navigateToRoom(playerPage, playerCtx, room.roomId, player.playerId, player.playerToken);

      const playerGame = new GamePage(playerPage);
      await playerGame.expectVisible();
      await wsReady;

      await api.endGame(room.roomId, room.host.playerToken);

      await playerPage.getByText('Game Over').waitFor({ state: 'visible' });

      await playerCtx.close();
    },
  );
});
