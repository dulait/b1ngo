import { test, expect } from '../../fixtures/base.fixture';
import { LobbyPage } from '../../pages/lobby.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupLobbyRoom } from '../../helpers/room.helper';

test.describe('BNG-006: Edit Square', () => {
  test('AC-1: edit square display text in lobby updates the square', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();

    await lobby.editSquare(0, 0, 'My Custom Event');
    await lobby.expectSquareText(0, 0, 'My Custom Event');
  });

  test('AC-2: editing clears EventKey (square becomes custom)', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.editSquare(0, 0, 'Custom Square');

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const card = state.players.find((p) => p.playerId === room.host.playerId)!.card!;
    const square = card.squares.find((s) => s.row === 0 && s.column === 0)!;
    expect(square.eventKey).toBeNull();
    expect(square.displayText).toBe('Custom Square');
  });

  test('AC-3: editing same square multiple times overwrites', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.editSquare(0, 0, 'First Edit');
    await lobby.expectSquareText(0, 0, 'First Edit');

    await lobby.editSquare(0, 0, 'Second Edit');
    await lobby.expectSquareText(0, 0, 'Second Edit');
  });

  test('ERR-5: cannot edit free space', async ({ page, context, api }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();

    await lobby.clickSquare(1, 1);
    await expect(lobby.editSheetTitle).not.toBeVisible();
  });
});
