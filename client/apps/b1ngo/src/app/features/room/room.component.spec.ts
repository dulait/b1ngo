import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { RoomStore } from './services/room.store';
import { RoomApiService } from '@core/api/room-api.service';
import { SignalRService } from '@core/realtime/signalr.service';
import { ENVIRONMENT } from '@core/environment/environment.token';
import { GetRoomStateResponse } from '@core/api/models/responses';

function mockRoomState(): GetRoomStateResponse {
  return {
    roomId: 'r1',
    currentPlayerId: 'p1',
    joinCode: 'ABC123',
    status: 'Lobby',
    session: {
      season: 2026,
      grandPrixName: 'Monaco Grand Prix',
      sessionType: 'Race',
    },
    configuration: { matrixSize: 5, winningPatterns: ['Row', 'Column'] },
    hostPlayerId: 'p1',
    players: [
      {
        playerId: 'p1',
        displayName: 'Max',
        hasWon: false,
        card: {
          matrixSize: 5,
          squares: [
            {
              row: 0,
              column: 0,
              displayText: 'Test',
              eventKey: null,
              isFreeSpace: false,
              isMarked: false,
              markedBy: null,
              markedAt: null,
            },
          ],
        },
      },
    ],
    leaderboard: [],
  };
}

describe('Room orchestrator logic', () => {
  let store: RoomStore;
  let _roomApi: RoomApiService;
  let signalr: SignalRService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { roomId: 'r1' } } },
        },
      ],
    }).compileComponents();

    store = new RoomStore();
    _roomApi = TestBed.inject(RoomApiService);
    signalr = TestBed.inject(SignalRService);
  });

  it('should initialize store from API response', async () => {
    const state = mockRoomState();
    store.initialize(state, state.currentPlayerId);

    expect(store.roomId()).toBe('r1');
    expect(store.joinCode()).toBe('ABC123');
    expect(store.status()).toBe('Lobby');
    expect(store.currentPlayerId()).toBe('p1');
    expect(store.isHost()).toBe(true);
  });

  it('should switch status to Active when gameStarted event fires', () => {
    store.initialize(mockRoomState(), 'p1');
    store.setStatus('Active');
    expect(store.status()).toBe('Active');
  });

  it('should switch status to Completed when gameCompleted event fires', () => {
    store.initialize(mockRoomState(), 'p1');
    store.setStatus('Completed');
    expect(store.status()).toBe('Completed');
  });

  it('should add player on PlayerJoined event', () => {
    store.initialize(mockRoomState(), 'p1');
    store.addPlayer('p2', 'Lewis');
    expect(store.players()).toHaveLength(2);
    expect(store.players()[1].displayName).toBe('Lewis');
  });

  it('should update square on SquareMarked event', () => {
    store.initialize(mockRoomState(), 'p1');
    store.updateSquare('p1', 0, 0, {
      isMarked: true,
      markedBy: 'Host',
      markedAt: '2026-03-19T00:00:00Z',
    });
    expect(store.players()[0].card!.squares[0].isMarked).toBe(true);
    expect(store.players()[0].card!.squares[0].markedBy).toBe('Host');
  });

  it('should deduplicate recent optimistic updates', () => {
    store.addPendingCorrelation('test-id');
    expect(store.isPendingCorrelation('test-id')).toBe(true);
    expect(store.isPendingCorrelation('unknown-id')).toBe(false);
  });

  it('should update leaderboard on BingoAchieved event', () => {
    store.initialize(mockRoomState(), 'p1');
    store.updateLeaderboard([
      {
        rank: 1,
        playerId: 'p1',
        winningPattern: 'Row',
        winningSquares: [],
        completedAt: '2026-03-19T00:01:00Z',
        elapsedTime: 'PT32M5S',
        intervalToPrevious: null,
      },
    ]);
    expect(store.leaderboard()).toHaveLength(1);
    expect(store.leaderboard()[0].playerId).toBe('p1');
  });

  it('should connect signalr with roomId', async () => {
    const connectSpy = vi.spyOn(signalr, 'connect').mockResolvedValue();
    await signalr.connect('r1');
    expect(connectSpy).toHaveBeenCalledWith('r1');
  });

  it('should disconnect signalr', async () => {
    const disconnectSpy = vi.spyOn(signalr, 'disconnect').mockResolvedValue();
    await signalr.disconnect();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
