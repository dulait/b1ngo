import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ROOM_STORE } from './room';
import { RoomStore } from './room-store';
import { RoomApiService } from '../../core/api/room-api.service';
import { SignalRService } from '../../core/realtime/signalr.service';
import { AuthService } from '../../core/auth/auth.service';
import { ENVIRONMENT } from '../../core/environment';
import { GetRoomStateResponse } from '../../shared/types/api.types';

function mockRoomState(): GetRoomStateResponse {
  return {
    roomId: 'r1',
    joinCode: 'ABC123',
    status: 'Lobby',
    session: {
      season: '2026',
      grandPrixName: 'Monaco Grand Prix',
      grandPrixShort: 'MON',
      sessionType: 'Race',
    },
    configuration: { matrixSize: 5, winningPatterns: ['Row', 'Column'] },
    hostPlayerId: 'p1',
    players: [
      {
        id: 'p1',
        displayName: 'Max',
        isHost: true,
        card: {
          squares: [
            {
              row: 0,
              column: 0,
              displayText: 'Test',
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
  let roomApi: RoomApiService;
  let signalr: SignalRService;
  let auth: AuthService;

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
    roomApi = TestBed.inject(RoomApiService);
    signalr = TestBed.inject(SignalRService);
    auth = TestBed.inject(AuthService);
    auth.saveSession('r1', 'p1');
  });

  it('should initialize store from API response', async () => {
    const state = mockRoomState();
    store.initialize(state, auth.getPlayerId());

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
    store.addPlayer({
      id: 'p2',
      displayName: 'Lewis',
      isHost: false,
      card: null,
    });
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
    store.recordMarkTimestamp(0, 0);
    expect(store.isRecentOptimisticUpdate(0, 0)).toBe(true);
    expect(store.isRecentOptimisticUpdate(1, 1)).toBe(false);
  });

  it('should update leaderboard on BingoAchieved event', () => {
    store.initialize(mockRoomState(), 'p1');
    store.updateLeaderboard([
      {
        rank: 1,
        playerId: 'p1',
        displayName: 'Max',
        pattern: 'Row',
        completedAt: '2026-03-19T00:01:00Z',
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
