import { test, expect } from '../../fixtures/base.fixture';
import { multiPlayerTest } from '../../fixtures/multi-player.fixture';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame } from '../../helpers/room.helper';
import { expectToast } from '../../helpers/toast.helper';

test.describe('BNG-007: Mark Square', () => {
  test('AC-1: marking a square changes its visual state to marked', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();

    await game.markSquare(0, 0);
    await game.expectSquareMarked(0, 0);
  });

  test('AC-5: mark that does not complete a pattern returns no bingo', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    const result = await api.markSquare(
      room.roomId,
      room.host.playerId,
      0,
      0,
      room.host.playerToken,
    );
    expect(result.isMarked).toBe(true);
    expect(result.bingo).toBeNull();
  });

  test('ERR-7: cannot mark free space (already marked)', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    const response = await api.markSquareRaw(
      room.roomId,
      room.host.playerId,
      1,
      1,
      room.host.playerToken,
    );
    expect(response.status()).toBe(409);
  });

  test('ERR-8: cannot double-mark a square', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.markSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);

    const response = await api.markSquareRaw(
      room.roomId,
      room.host.playerId,
      0,
      0,
      room.host.playerToken,
    );
    expect(response.status()).toBe(409);
  });

  test('AC-8: optimistic update appears marked immediately', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();

    await game.clickSquare(0, 0);
    await game.expectSquareMarked(0, 0);
  });

  test('AC-8: optimistic rollback on server error shows toast', async ({
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

multiPlayerTest.describe('BNG-007: Mark Square / Real-Time', () => {
  multiPlayerTest(
    'RT-1: marking a square is visible to all connected players',
    async ({ browser, api }) => {
      const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
      const player = room.players[0];

      const hostCtx = await browser.newContext({ ignoreHTTPSErrors: true });
      const hostPage = await hostCtx.newPage();
      await navigateToRoom(hostPage, hostCtx, room.roomId, room.host.playerId, room.host.playerToken);

      const hostGame = new GamePage(hostPage);
      await hostGame.expectVisible();

      await api.markSquare(room.roomId, player.playerId, 0, 0, player.playerToken);

      const state = await api.getRoomState(room.roomId, room.host.playerToken);
      const playerCard = state.players.find((p) => p.playerId === player.playerId)!.card!;
      const square = playerCard.squares.find((s) => s.row === 0 && s.column === 0)!;
      expect(square.isMarked).toBe(true);

      await hostCtx.close();
    },
  );
});
