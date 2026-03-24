import { describe, it, expect, beforeEach } from 'vitest';
import { RoomStore } from './room.store';
import { GetRoomStateResponse } from '@core/api/models/responses';
import { PlayerDto, SquareDto, LeaderboardEntryDto } from '@core/api/models/dtos';

function mockSquare(overrides: Partial<SquareDto> = {}): SquareDto {
  return {
    row: 0,
    column: 0,
    displayText: 'Test',
    eventKey: null,
    isFreeSpace: false,
    isMarked: false,
    markedBy: null,
    markedAt: null,
    ...overrides,
  };
}

function mockPlayer(overrides: Partial<PlayerDto> = {}): PlayerDto {
  return {
    playerId: 'p1',
    displayName: 'Player 1',
    hasWon: false,
    card: { matrixSize: 5, squares: [mockSquare()] },
    ...overrides,
  };
}

function mockRoomState(overrides: Partial<GetRoomStateResponse> = {}): GetRoomStateResponse {
  return {
    roomId: 'r1',
    joinCode: 'ABC123',
    status: 'Lobby',
    session: {
      season: 2026,
      grandPrixName: 'Monaco Grand Prix',
      sessionType: 'Race',
    },
    configuration: { matrixSize: 5, winningPatterns: ['Row', 'Column'] },
    hostPlayerId: 'p1',
    players: [mockPlayer()],
    leaderboard: [],
    ...overrides,
  };
}

describe('RoomStore', () => {
  let store: RoomStore;

  beforeEach(() => {
    store = new RoomStore();
  });

  describe('initialize', () => {
    it('should set all server state from response', () => {
      const state = mockRoomState();
      store.initialize(state, 'p1');

      expect(store.roomId()).toBe('r1');
      expect(store.joinCode()).toBe('ABC123');
      expect(store.status()).toBe('Lobby');
      expect(store.session()?.grandPrixName).toBe('Monaco Grand Prix');
      expect(store.configuration()?.matrixSize).toBe(5);
      expect(store.hostPlayerId()).toBe('p1');
      expect(store.players()).toHaveLength(1);
      expect(store.leaderboard()).toHaveLength(0);
      expect(store.currentPlayerId()).toBe('p1');
    });
  });

  describe('derived state', () => {
    it('should derive isHost when currentPlayer is host', () => {
      store.initialize(mockRoomState({ hostPlayerId: 'p1' }), 'p1');
      expect(store.isHost()).toBe(true);
    });

    it('should derive isHost as false when currentPlayer is not host', () => {
      store.initialize(mockRoomState({ hostPlayerId: 'p1' }), 'p2');
      expect(store.isHost()).toBe(false);
    });

    it('should derive currentPlayer from players list', () => {
      const player = mockPlayer({ playerId: 'p2', displayName: 'Alice' });
      store.initialize(mockRoomState({ players: [mockPlayer(), player] }), 'p2');
      expect(store.currentPlayer()?.displayName).toBe('Alice');
    });

    it('should return null currentPlayer when not found', () => {
      store.initialize(mockRoomState({ players: [] }), 'p99');
      expect(store.currentPlayer()).toBeNull();
    });

    it('should derive currentCard from currentPlayer', () => {
      const squares = [mockSquare({ displayText: 'Test square' })];
      const player = mockPlayer({ playerId: 'p1', card: { matrixSize: 5, squares } });
      store.initialize(mockRoomState({ players: [player] }), 'p1');
      expect(store.currentCard()?.squares).toHaveLength(1);
      expect(store.currentCard()?.squares[0].displayText).toBe('Test square');
    });

    it('should derive matrixSize from configuration', () => {
      store.initialize(
        mockRoomState({ configuration: { matrixSize: 7, winningPatterns: ['Row'] } }),
        'p1',
      );
      expect(store.matrixSize()).toBe(7);
    });

    it('should default matrixSize to 5 when no configuration', () => {
      expect(store.matrixSize()).toBe(5);
    });
  });

  describe('UI mapped signals', () => {
    it('should map players to bng-ui format', () => {
      store.initialize(
        mockRoomState({
          players: [
            mockPlayer({ playerId: 'p1', displayName: 'Max' }),
            mockPlayer({ playerId: 'p2', displayName: 'Lewis' }),
          ],
        }),
        'p1',
      );

      const uiPlayers = store.uiPlayers();
      expect(uiPlayers).toHaveLength(2);
      expect(uiPlayers[0]).toEqual({ playerId: 'p1', displayName: 'Max' });
      expect(uiPlayers[1]).toEqual({ playerId: 'p2', displayName: 'Lewis' });
    });

    it('should map leaderboard to bng-ui format', () => {
      const entry: LeaderboardEntryDto = {
        rank: 1,
        playerId: 'p1',
        winningPattern: 'Row',
        winningSquares: [],
        completedAt: '2026-03-19T00:00:00Z',
      };
      store.initialize(mockRoomState({ leaderboard: [entry] }), 'p1');

      const uiEntries = store.uiLeaderboard();
      expect(uiEntries).toHaveLength(1);
      expect(uiEntries[0]).toEqual({
        rank: 1,
        playerId: 'p1',
        pattern: 'Row',
        completedAt: '2026-03-19T00:00:00Z',
      });
    });

    it('should map session to bng-ui format', () => {
      store.initialize(mockRoomState(), 'p1');
      const uiSession = store.uiSession();
      expect(uiSession).toEqual({ grandPrixShort: 'MON', sessionType: 'Race' });
    });

    it('should return null uiSession when no session', () => {
      expect(store.uiSession()).toBeNull();
    });
  });

  describe('mutations', () => {
    it('should add player to list', () => {
      store.initialize(mockRoomState({ players: [] }), 'p1');
      store.addPlayer('p2', 'Alice');
      expect(store.players()).toHaveLength(1);
      expect(store.players()[0].displayName).toBe('Alice');
    });

    it('should update square for specific player', () => {
      const squares = [
        mockSquare({ row: 0, column: 0, displayText: 'Original' }),
        mockSquare({ row: 0, column: 1, displayText: 'Other' }),
      ];
      const player = mockPlayer({ playerId: 'p1', card: { matrixSize: 5, squares } });
      store.initialize(mockRoomState({ players: [player] }), 'p1');

      store.updateSquare('p1', 0, 0, { isMarked: true, markedBy: 'Player' });

      const updated = store.players()[0].card!.squares;
      expect(updated[0].isMarked).toBe(true);
      expect(updated[0].markedBy).toBe('Player');
      expect(updated[1].isMarked).toBe(false);
    });

    it('should not update square for wrong player', () => {
      const player = mockPlayer({
        playerId: 'p1',
        card: { matrixSize: 5, squares: [mockSquare()] },
      });
      store.initialize(mockRoomState({ players: [player] }), 'p1');

      store.updateSquare('p99', 0, 0, { isMarked: true });

      expect(store.players()[0].card!.squares[0].isMarked).toBe(false);
    });

    it('should handle updateSquare when player has no card', () => {
      const player = mockPlayer({ playerId: 'p1', card: null });
      store.initialize(mockRoomState({ players: [player] }), 'p1');

      store.updateSquare('p1', 0, 0, { isMarked: true });
      expect(store.players()[0].card).toBeNull();
    });

    it('should set status', () => {
      store.initialize(mockRoomState(), 'p1');
      store.setStatus('Active');
      expect(store.status()).toBe('Active');
    });

    it('should update leaderboard', () => {
      store.initialize(mockRoomState(), 'p1');
      const entries: LeaderboardEntryDto[] = [
        {
          rank: 1,
          playerId: 'p1',
          winningPattern: 'Row',
          winningSquares: [],
          completedAt: '2026-03-19T00:00:00Z',
        },
      ];
      store.updateLeaderboard(entries);
      expect(store.leaderboard()).toHaveLength(1);
      expect(store.leaderboard()[0].rank).toBe(1);
    });
  });

  describe('deduplication', () => {
    it('should detect pending correlation', () => {
      store.addPendingCorrelation('abc-123');
      expect(store.isPendingCorrelation('abc-123')).toBe(true);
    });

    it('should remove correlation after detection', () => {
      store.addPendingCorrelation('abc-123');
      store.isPendingCorrelation('abc-123');
      expect(store.isPendingCorrelation('abc-123')).toBe(false);
    });

    it('should return false for unknown correlation', () => {
      expect(store.isPendingCorrelation('unknown')).toBe(false);
    });

    it('should return false for undefined correlation', () => {
      expect(store.isPendingCorrelation(undefined)).toBe(false);
    });

    it('should allow explicit removal of pending correlation', () => {
      store.addPendingCorrelation('abc-123');
      store.removePendingCorrelation('abc-123');
      expect(store.isPendingCorrelation('abc-123')).toBe(false);
    });
  });
});
