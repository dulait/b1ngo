import { test, expect } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame, setupLobbyRoom } from '../../helpers/room.helper';
import { expectToast, expectNoToast } from '../../helpers/toast.helper';

test.describe('Centralized Error Handling', () => {
  test('404 shows toast with server message', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom('ZZZZZZ', 'LostPlayer');

    await expectToast(page, /not found/i);
    await expect(page).toHaveURL('/');
  });

  test('409 shows toast with server message', async ({ page, api }) => {
    const room = await setupLobbyRoom(api, { hostDisplayName: 'DupeHost' });
    const home = new HomePage(page);
    await home.goto();
    await home.joinRoom(room.joinCode, 'DupeHost');

    await expectToast(page, /already exists/i);
    await expect(page).toHaveURL('/');
  });

  test('network error (offline) shows toast', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort('connectionrefused'));
    await page.goto('/');

    await expectToast(page, /network error/i);
  });

  test('client-side required field validation shows no toast on empty submit', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.selectFirstAvailableOptions();
    await home.submitCreateRoom({ force: true });

    await expect(page).toHaveURL('/');
    await expectNoToast(page);
  });

  test('optimistic rollback on mark failure: square reverts, toast shown', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();

    await page.route('**/mark', (route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Square is already marked.' }),
      }),
    );

    await game.clickSquare(0, 0);

    await expectToast(page, 'Square is already marked.');
    await game.expectSquareUnmarked(0, 0);
  });
});
