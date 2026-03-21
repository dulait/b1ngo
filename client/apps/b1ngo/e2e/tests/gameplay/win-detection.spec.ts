import { test, expect } from '../../fixtures/base.fixture';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame } from '../../helpers/room.helper';
import { completePattern, completePatternExceptLast } from '../../helpers/card.helper';
import { getLeaderboard } from '../../helpers/game.helper';

test.describe('BNG-009: Win Detection', () => {
  test('AC-1: completing a Row pattern triggers bingo with correct pattern', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    const result = await completePattern(
      api,
      room.roomId,
      room.host.playerId,
      room.host.playerToken,
      'row',
      0,
    );

    expect(result).toBeTruthy();
    expect(result!.bingo).toBeTruthy();
    expect(result!.bingo!.pattern).toBe('Row');
    expect(result!.bingo!.rank).toBe(1);
  });

  test('AC-2: completing a Column pattern triggers bingo', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    const result = await completePattern(
      api,
      room.roomId,
      room.host.playerId,
      room.host.playerToken,
      'column',
      0,
    );

    expect(result).toBeTruthy();
    expect(result!.bingo).toBeTruthy();
    expect(result!.bingo!.pattern).toBe('Column');
  });

  test('AC-3: completing main Diagonal triggers bingo', async ({ api }) => {
    const room = await setupActiveGame(api, {
      matrixSize: 3,
      winningPatterns: ['Diagonal'],
    });
    const result = await completePattern(
      api,
      room.roomId,
      room.host.playerId,
      room.host.playerToken,
      'main-diagonal',
    );

    expect(result).toBeTruthy();
    expect(result!.bingo).toBeTruthy();
    expect(result!.bingo!.pattern).toBe('Diagonal');
  });

  test('AC-4: completing anti-Diagonal triggers bingo', async ({ api }) => {
    const room = await setupActiveGame(api, {
      matrixSize: 3,
      winningPatterns: ['Diagonal'],
    });

    const result = await completePattern(
      api,
      room.roomId,
      room.host.playerId,
      room.host.playerToken,
      'anti-diagonal',
    );

    expect(result).toBeTruthy();
    expect(result!.bingo).toBeTruthy();
    expect(result!.bingo!.pattern).toBe('Diagonal');
  });

  test('AC-5: completing Blackout triggers bingo', async ({ api }) => {
    const room = await setupActiveGame(api, {
      matrixSize: 3,
      winningPatterns: ['Blackout'],
    });
    const result = await completePattern(
      api,
      room.roomId,
      room.host.playerId,
      room.host.playerToken,
      'blackout',
    );

    expect(result).toBeTruthy();
    expect(result!.bingo).toBeTruthy();
    expect(result!.bingo!.pattern).toBe('Blackout');
  });

  test('AC-12: multiple winners get sequential ranks', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3, playerCount: 2 });
    const player = room.players[0];

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);
    await completePattern(api, room.roomId, player.playerId, player.playerToken, 'row', 0);

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].playerId).toBe(room.host.playerId);
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].playerId).toBe(player.playerId);
  });

  test('AC-13: already won player marking another square does not create duplicate entry', async ({
    api,
  }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);

    const result = await api.markSquare(
      room.roomId,
      room.host.playerId,
      2,
      0,
      room.host.playerToken,
    );
    expect(result.bingo).toBeNull();

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard).toHaveLength(1);
  });

  test('AC-14: mark not completing a pattern returns null bingo', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    const result = await api.markSquare(
      room.roomId,
      room.host.playerId,
      0,
      0,
      room.host.playerToken,
    );
    expect(result.bingo).toBeNull();
  });

  test('win detection visible in UI with leaderboard entry', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    const lastCoord = await completePatternExceptLast(
      api,
      room.roomId,
      room.host.playerId,
      room.host.playerToken,
      'row',
      0,
    );

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);
    const game = new GamePage(page);
    await game.expectVisible();

    await game.markSquare(lastCoord.row, lastCoord.col);
    await game.expectLeaderboardEntry(1, room.host.displayName);
  });

  test('winning squares are highlighted in UI', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });

    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);

    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);
    const game = new GamePage(page);
    await game.expectVisible();

    await game.expectSquareWinning(0, 0);
    await game.expectSquareWinning(0, 1);
    await game.expectSquareWinning(0, 2);
  });

  test('leaderboard entry contains winning squares coordinates', async ({ api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await completePattern(api, room.roomId, room.host.playerId, room.host.playerToken, 'row', 0);

    const leaderboard = await getLeaderboard(api, room.roomId, room.host.playerToken);
    expect(leaderboard[0].winningSquares).toBeDefined();
    expect(leaderboard[0].winningSquares.length).toBe(3);

    for (const sq of leaderboard[0].winningSquares) {
      expect(sq.row).toBe(0);
    }
  });
});
