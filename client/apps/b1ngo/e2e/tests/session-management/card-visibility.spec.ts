import { test, expect } from '../../fixtures/base.fixture';
import { setupActiveGame, setupLobbyRoom } from '../../helpers/room.helper';
import { completePattern } from '../../helpers/card.helper';

test.describe('BNG-015: Card Visibility', () => {
  test('AC-1: non-host player sees only own card', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    const state = await api.getRoomState(room.roomId, player.playerToken);

    const self = state.players.find((p) => p.playerId === player.playerId)!;
    expect(self.card).not.toBeNull();
    expect(self.card!.squares.length).toBeGreaterThan(0);

    const others = state.players.filter((p) => p.playerId !== player.playerId);
    for (const other of others) {
      expect(other.card).toBeNull();
    }
  });

  test('AC-2: host sees all players cards', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 3 });

    const state = await api.getRoomState(room.roomId, room.host.playerToken);

    for (const player of state.players) {
      expect(player.card).not.toBeNull();
      expect(player.card!.squares.length).toBeGreaterThan(0);
    }
  });

  test('AC-3: card visibility rules apply in Lobby status', async ({ api }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    const playerState = await api.getRoomState(room.roomId, player.playerToken);
    const self = playerState.players.find((p) => p.playerId === player.playerId)!;
    expect(self.card).not.toBeNull();

    const others = playerState.players.filter((p) => p.playerId !== player.playerId);
    for (const other of others) {
      expect(other.card).toBeNull();
    }

    const hostState = await api.getRoomState(room.roomId, room.host.playerToken);
    for (const p of hostState.players) {
      expect(p.card).not.toBeNull();
    }
  });

  test('AC-4: card visibility rules apply in Completed status', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    await api.endGame(room.roomId, room.host.playerToken);

    const playerState = await api.getRoomState(room.roomId, player.playerToken);
    const self = playerState.players.find((p) => p.playerId === player.playerId)!;
    expect(self.card).not.toBeNull();

    const others = playerState.players.filter((p) => p.playerId !== player.playerId);
    for (const other of others) {
      expect(other.card).toBeNull();
    }
  });

  test('AC-5: leaderboard with winning squares visible to all players', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await api.endGame(room.roomId, room.host.playerToken);

    const playerState = await api.getRoomState(room.roomId, player.playerToken);
    expect(playerState.leaderboard).toHaveLength(1);
    expect(playerState.leaderboard[0].winningSquares).toBeDefined();
    expect(playerState.leaderboard[0].winningSquares.length).toBeGreaterThan(0);
  });
});
