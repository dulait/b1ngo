import { test, expect } from '../../fixtures/base.fixture';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { LobbyPage } from '../../pages/lobby.page';
import { setupLobbyRoom } from '../../helpers/room.helper';

test.describe('BNG-005: Card Generation', () => {
  test('AC-1: 5x5 card has 25 squares with free space at center (2,2)', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api);
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const card = state.players.find((p) => p.playerId === room.host.playerId)!.card!;

    expect(card.matrixSize).toBe(5);
    expect(card.squares).toHaveLength(25);

    const freeSpace = card.squares.find((s) => s.row === 2 && s.column === 2)!;
    expect(freeSpace.isFreeSpace).toBe(true);
    expect(freeSpace.isMarked).toBe(true);
    expect(freeSpace.displayText).toBe('FREE');
  });

  test('AC-2: 3x3 card has 9 squares with free space at center (1,1)', async ({ api }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const card = state.players.find((p) => p.playerId === room.host.playerId)!.card!;

    expect(card.matrixSize).toBe(3);
    expect(card.squares).toHaveLength(9);

    const freeSpace = card.squares.find((s) => s.row === 1 && s.column === 1)!;
    expect(freeSpace.isFreeSpace).toBe(true);
    expect(freeSpace.isMarked).toBe(true);
    expect(freeSpace.displayText).toBe('FREE');
  });

  test('AC-4: two players in same room have different cards', async ({ api }) => {
    const room = await setupLobbyRoom(api, { playerCount: 2 });
    const state = await api.getRoomState(room.roomId, room.host.playerToken);

    const hostCard = state.players.find((p) => p.playerId === room.host.playerId)!.card!;
    const playerCard = state.players.find((p) => p.playerId === room.players[0].playerId)!.card!;

    const hostTexts = hostCard.squares
      .filter((s) => !s.isFreeSpace)
      .map((s) => s.displayText)
      .join(',');
    const playerTexts = playerCard.squares
      .filter((s) => !s.isFreeSpace)
      .map((s) => s.displayText)
      .join(',');

    expect(hostTexts).not.toBe(playerTexts);
  });

  test('AC-6: non-free squares have non-empty displayText, eventKey, not marked', async ({
    api,
  }) => {
    const room = await setupLobbyRoom(api);
    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const card = state.players.find((p) => p.playerId === room.host.playerId)!.card!;

    for (const square of card.squares) {
      if (!square.isFreeSpace) {
        expect(square.displayText).toBeTruthy();
        expect(square.eventKey).toBeTruthy();
        expect(square.isMarked).toBe(false);
        expect(square.isFreeSpace).toBe(false);
      }
    }
  });

  test('AC-7: free space has correct properties', async ({ api }) => {
    const room = await setupLobbyRoom(api);
    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const card = state.players.find((p) => p.playerId === room.host.playerId)!.card!;
    const freeSpace = card.squares.find((s) => s.isFreeSpace)!;

    expect(freeSpace.displayText).toBe('FREE');
    expect(freeSpace.eventKey).toBeNull();
    expect(freeSpace.isFreeSpace).toBe(true);
    expect(freeSpace.isMarked).toBe(true);
  });

  test('AC-5: card UI rendering matches API data', async ({ page, context, api }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();

    const state = await api.getRoomState(room.roomId, room.host.playerToken);
    const card = state.players.find((p) => p.playerId === room.host.playerId)!.card!;

    const firstSquare = card.squares.find((s) => s.row === 0 && s.column === 0)!;
    await lobby.expectSquareText(0, 0, firstSquare.displayText);
    await lobby.expectFreeSpace(1, 1);
  });
});
