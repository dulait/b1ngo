import { test, expect } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';
import { LobbyPage } from '../../pages/lobby.page';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame, setupLobbyRoom } from '../../helpers/room.helper';

test.describe('BNG-014: Session Lifecycle', () => {
  test('AC-1: no session shows home page', async ({ page }) => {
    await page.goto('/');
    const home = new HomePage(page);
    await home.expectOnHomePage();
  });

  test('AC-2: creating a room sets bng-session and PlayerToken cookie', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    const home = new HomePage(page);

    await home.createRoom(`Host_${Date.now()}`);
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    expect(session).not.toBeNull();
    const parsed = JSON.parse(session!);
    expect(parsed.roomId).toBeDefined();
    expect(parsed.playerId).toBeDefined();

    const cookies = await context.cookies();
    const playerTokenCookie = cookies.find((c) => c.name === 'PlayerToken');
    expect(playerTokenCookie).toBeDefined();
  });

  test('AC-3: joining a room sets bng-session and PlayerToken cookie', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });

    await page.goto('/');
    const home = new HomePage(page);
    await home.joinRoom(room.joinCode, `Joiner_${Date.now()}`);
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    expect(session).not.toBeNull();
    const parsed = JSON.parse(session!);
    expect(parsed.roomId).toBe(room.roomId);

    const cookies = await context.cookies();
    const playerTokenCookie = cookies.find((c) => c.name === 'PlayerToken');
    expect(playerTokenCookie).toBeDefined();
  });

  test('AC-4: session is shared across tabs via localStorage', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();

    const page2 = await context.newPage();
    await page2.goto('/');

    await page2.waitForURL(/\/room\//, { timeout: 5000 });

    await page2.close();
  });

  test('AC-6: cleared localStorage shows home page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    const home = new HomePage(page);
    await home.expectOnHomePage();
  });

  test('AC-7: duplicate display name rejected on rejoin', async ({ api }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3, hostDisplayName: 'TestHost' });

    try {
      await api.joinRoom(room.joinCode, 'TestHost');
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.message).toContain('409');
    }
  });

  test('AC-8: different display name creates new player on rejoin', async ({ api }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });

    const joined = await api.joinRoom(room.joinCode, `NewPlayer_${Date.now()}`);
    expect(joined.playerId).toBeDefined();
    expect(joined.playerToken).toBeDefined();

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    expect(state.players.length).toBe(2);
  });

  test('AC-9: bng-session remains after game completes', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();

    await api.endGame(room.roomId, room.host.playerToken);

    await page.getByTestId('results-game-over').waitFor({ state: 'visible' });

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    expect(session).not.toBeNull();
  });
});
