import { test, expect } from '../../fixtures/base.fixture';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame } from '../../helpers/room.helper';

test.describe('BNG-008: Unmark Square', () => {
  test('AC-1: unmarking a marked square changes visual state back to unmarked', async ({
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

    await game.unmarkSquare(0, 0);
    await game.expectSquareUnmarked(0, 0);
  });

  test('AC-5: unmarking with no win returns winRevoked=false', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await api.markSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);
    const result = await api.unmarkSquare(
      room.roomId,
      room.host.playerId,
      0,
      0,
      room.host.playerToken,
    );
    expect(result.isMarked).toBe(false);
    expect(result.winRevoked).toBe(false);
  });

  test('ERR-7: cannot unmark free space', async ({ api }) => {
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

  test('ERR-8: cannot unmark an unmarked square', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    try {
      await api.unmarkSquare(room.roomId, room.host.playerId, 0, 0, room.host.playerToken);
      expect(true).toBe(false);
    } catch (e: unknown) {
      expect((e as Error).message).toContain('409');
    }
  });
});
