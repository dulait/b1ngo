import { test, expect, dismissTutorial } from '../../fixtures/base.fixture';
import { multiPlayerTest } from '../../fixtures/multi-player.fixture';
import { HomePage } from '../../pages/home.page';
import { LobbyPage } from '../../pages/lobby.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupLobbyRoom } from '../../helpers/room.helper';
import { expectToast } from '../../helpers/toast.helper';

test.describe('BNG-002: Join Room', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('AC-1: joins room with valid join code and display name', async ({ page, api }) => {
    const room = await setupLobbyRoom(api);
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom(room.joinCode, 'Player1');
    await home.expectNavigatedToRoom();

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
  });

  test('AC-2: sets PlayerToken cookie on join', async ({ page, context, api }) => {
    const room = await setupLobbyRoom(api);
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom(room.joinCode, 'CookiePlayer');
    await home.expectNavigatedToRoom();

    const cookies = await context.cookies();
    const playerToken = cookies.find((c) => c.name === 'PlayerToken');
    expect(playerToken).toBeTruthy();
    expect(playerToken!.httpOnly).toBe(true);
  });

  test('AC-3: stores bng-session in localStorage on join', async ({ page, api }) => {
    const room = await setupLobbyRoom(api);
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom(room.joinCode, 'SessionPlayer');
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    expect(session).toBeTruthy();
    const parsed = JSON.parse(session!);
    expect(parsed.roomId).toBe(room.roomId);
    expect(parsed.playerId).toBeTruthy();
  });

  test('AC-4: auto-uppercases lowercase join code input', async ({ page, api }) => {
    const room = await setupLobbyRoom(api);
    const home = new HomePage(page);
    await home.goto();

    const lowerCode = room.joinCode.toLowerCase();
    await home.joinCodeInput.click();
    await home.joinCodeInput.locator('input').pressSequentially(lowerCode, { delay: 50 });

    const codeBoxes = home.joinCodeInput.locator('[class*="flex"]').first();
    await expect(codeBoxes).toContainText(room.joinCode.charAt(0));
  });

  test('ERR-6: rejects non-existent join code with toast', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom('ZZZZZZ', 'LostPlayer');

    await expectToast(page, /not found/i);
    await expect(page).toHaveURL('/');
  });

  test('ERR-9: rejects duplicate display name with toast', async ({ page, api }) => {
    const room = await setupLobbyRoom(api, { hostDisplayName: 'DupeHost' });
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom(room.joinCode, 'DupeHost');

    await expectToast(page, /already exists/i);
    await expect(page).toHaveURL('/');
  });

  test('ERR-7: rejects room not in lobby with toast', async ({ page, api }) => {
    const room = await setupLobbyRoom(api);
    await api.startGame(room.roomId, room.host.playerToken);

    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom(room.joinCode, 'LatePlayer');

    await expectToast(page, /Cannot add players/i);
    await expect(page).toHaveURL('/');
  });
});

multiPlayerTest.describe('BNG-002: Join Room / Real-Time', () => {
  multiPlayerTest(
    'RT-1: PlayerJoined event updates host player list',
    async ({ browser, api }) => {
      const room = await setupLobbyRoom(api);

      const hostContext = await browser.newContext({ ignoreHTTPSErrors: true });
      const hostPage = await hostContext.newPage();
      await navigateToRoom(hostPage, hostContext, room.roomId, room.host.playerId, room.host.playerToken);
      const hostLobby = new LobbyPage(hostPage);
      await hostLobby.expectVisible();

      const playerContext = await browser.newContext({ ignoreHTTPSErrors: true });
      const playerPage = await playerContext.newPage();
      await dismissTutorial(playerPage);
      await playerPage.goto('/');
      await playerPage.evaluate(() => localStorage.clear());
      await playerPage.evaluate(() => localStorage.setItem('bng-tutorial-completed', 'true'));
      const playerHome = new HomePage(playerPage);
      await playerHome.joinRoom(room.joinCode, 'RealtimeJoiner');

      await hostLobby.expectPlayerVisible('RealtimeJoiner');

      await hostContext.close();
      await playerContext.close();
    },
  );
});
