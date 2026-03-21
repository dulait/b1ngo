import { test, expect } from '../../fixtures/base.fixture';
import { LobbyPage } from '../../pages/lobby.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupLobbyRoom } from '../../helpers/room.helper';

test.describe('BNG-004: Lobby View', () => {
  test('AC-1: host sees join code, player list, Start Game button, and card', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api);
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
    await lobby.expectStartGameVisible();
    await lobby.expectPlayerVisible(room.host.displayName);
  });

  test('AC-2: non-host player sees lobby but no Start Game button', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { playerCount: 2 });
    const player = room.players[0];
    await navigateToRoom(page, context, room.roomId, player.playerId, player.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
    await lobby.expectStartGameNotVisible();
    await lobby.expectPlayerVisible(player.displayName);
    await lobby.expectPlayerVisible(room.host.displayName);
  });

  test('AC-6: free space at center shows FREE and appears marked', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
    await lobby.expectFreeSpace(1, 1);
  });

  test('AC-7: join code is prominently displayed', async ({ page, context, api }) => {
    const room = await setupLobbyRoom(api);
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await expect(lobby.joinCodeDisplay).toBeVisible();
    await expect(lobby.joinCodeDisplay).toContainText(room.joinCode.charAt(0));
  });

  test('player count reflects number of players', async ({ page, context, api }) => {
    const room = await setupLobbyRoom(api, { playerCount: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectPlayerCount(3);
  });
});
