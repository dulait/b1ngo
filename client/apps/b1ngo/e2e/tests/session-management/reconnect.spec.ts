import { test, expect } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';
import { LobbyPage } from '../../pages/lobby.page';
import { GamePage } from '../../pages/game.page';
import { ResultsPage } from '../../pages/results.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame, setupLobbyRoom, ensureRoomStatus } from '../../helpers/room.helper';


test.describe('BNG-013: Reconnect', () => {
  test('AC-1: reconnect returns roomId, playerId, and roomStatus', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    const response = await api.reconnect(room.host.playerToken);
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body.roomId).toBe(room.roomId);
    expect(body.playerId).toBe(room.host.playerId);
    expect(body.roomStatus).toBeDefined();
  });

  test('AC-2: reconnect to Lobby room navigates to lobby view', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
  });

  test('AC-3: reconnect to Active room navigates to game view', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();
  });

  test('AC-4: reconnect to Completed room navigates to results view', async ({
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
  });

  test('AC-5: marks are preserved after reconnect', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await api.markSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();
    await game.expectSquareMarked(0, 0);
  });

  test('ERR-1: reconnect with invalid token returns 401', async ({ api }) => {
    const response = await api.reconnect('invalid-token-value');
    expect(response.status()).toBe(401);
  });

  test('ERR-1: invalid session clears localStorage and shows home', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await context.addCookies([
      {
        name: 'PlayerToken',
        value: 'invalid-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      },
    ]);
    await page.evaluate(() => {
      localStorage.setItem(
        'bng-session',
        JSON.stringify({ roomId: 'fake-room', playerId: 'fake-player', playerToken: 'invalid-token' }),
      );
    });

    await page.goto('/');

    const home = new HomePage(page);
    await home.expectOnHomePage();

    await page.waitForFunction(() => localStorage.getItem('bng-session') === null);
    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    expect(session).toBeNull();
  });
});
