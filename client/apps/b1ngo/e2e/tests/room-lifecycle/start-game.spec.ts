import { test } from '../../fixtures/base.fixture';
import { multiPlayerTest } from '../../fixtures/multi-player.fixture';
import { LobbyPage } from '../../pages/lobby.page';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupLobbyRoom } from '../../helpers/room.helper';

test.describe('BNG-003: Start Game', () => {
  test('AC-1: host starts game and room transitions to Active', async ({
    page,
    context,
    api,
  }) => {
    const room = await setupLobbyRoom(api);
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
    await lobby.startGame();

    const game = new GamePage(page);
    await game.expectVisible();
  });

  test('AC-2: single player (host only) can start game', async ({ page, context, api }) => {
    const room = await setupLobbyRoom(api, { playerCount: 1 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const lobby = new LobbyPage(page);
    await lobby.startGame();

    const game = new GamePage(page);
    await game.expectVisible();
  });

  test('ERR-2: non-host player does not see Start Game button', async ({
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
  });
});

multiPlayerTest.describe('BNG-003: Start Game / Real-Time', () => {
  multiPlayerTest(
    'RT-1: all connected players see UI transition from lobby to game view',
    async ({ browser, api }) => {
      const room = await setupLobbyRoom(api, { playerCount: 2 });
      const player = room.players[0];

      const hostCtx = await browser.newContext({ ignoreHTTPSErrors: true });
      const hostPage = await hostCtx.newPage();
      await navigateToRoom(hostPage, hostCtx, room.roomId, room.host.playerId, room.host.playerToken);

      const playerCtx = await browser.newContext({ ignoreHTTPSErrors: true });
      const playerPage = await playerCtx.newPage();
      await navigateToRoom(playerPage, playerCtx, room.roomId, player.playerId, player.playerToken);

      const playerLobby = new LobbyPage(playerPage);
      await playerLobby.expectVisible();

      const hostLobby = new LobbyPage(hostPage);
      await hostLobby.startGame();

      const playerGame = new GamePage(playerPage);
      await playerGame.expectVisible();

      await hostCtx.close();
      await playerCtx.close();
    },
  );
});
