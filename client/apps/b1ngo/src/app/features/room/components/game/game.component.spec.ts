import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { GameComponent } from './game.component';
import { ROOM_STORE } from '../../services/room-store.token';
import { RoomStore } from '../../services/room.store';
import { RoomApiService } from '@core/api/room-api.service';
import { SignalRService } from '@core/realtime/signalr.service';
import { ENVIRONMENT } from '@core/environment/environment.token';
import { GetRoomStateResponse } from '@core/api/models/responses';

function mockRoomState(): GetRoomStateResponse {
  return {
    roomId: 'r1',
    currentPlayerId: 'p1',
    joinCode: 'ABC123',
    status: 'Active',
    session: {
      season: 2026,
      grandPrixName: 'Monaco Grand Prix',
      sessionType: 'Race',
    },
    configuration: { matrixSize: 5, winningPatterns: ['Row'] },
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
            {
              row: 0,
              column: 1,
              displayText: 'Other',
              eventKey: null,
              isFreeSpace: false,
              isMarked: true,
              markedBy: 'Player',
              markedAt: '2026-03-19T00:00:00Z',
            },
          ],
        },
      },
    ],
    leaderboard: [],
  };
}

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let store: RoomStore;
  let roomApi: RoomApiService;

  beforeEach(async () => {
    store = new RoomStore();
    store.initialize(mockRoomState(), 'p1');

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
        { provide: ROOM_STORE, useValue: store },
      ],
    }).compileComponents();

    const signalr = TestBed.inject(SignalRService);
    signalr.connectionState.set('connected');

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    roomApi = TestBed.inject(RoomApiService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should optimistically mark a square and call API', async () => {
    const markSpy = vi.spyOn(roomApi, 'markSquare').mockResolvedValue();

    await component.onSquareMark({ row: 0, column: 0 });

    expect(markSpy).toHaveBeenCalledWith('r1', 'p1', 0, 0, expect.any(String));
    expect(store.players()[0].card!.squares[0].isMarked).toBe(true);
    expect(store.players()[0].card!.squares[0].markedBy).toBe('Player');
  });

  it('should rollback mark on API failure', async () => {
    vi.spyOn(roomApi, 'markSquare').mockRejectedValue(new Error('fail'));

    await component.onSquareMark({ row: 0, column: 0 });

    expect(store.players()[0].card!.squares[0].isMarked).toBe(false);
    expect(store.players()[0].card!.squares[0].markedBy).toBeNull();
  });

  it('should optimistically unmark a square and call API', async () => {
    const unmarkSpy = vi.spyOn(roomApi, 'unmarkSquare').mockResolvedValue();

    await component.onSquareUnmark({ row: 0, column: 1 });

    expect(unmarkSpy).toHaveBeenCalledWith('r1', 'p1', 0, 1, expect.any(String));
    expect(store.players()[0].card!.squares[1].isMarked).toBe(false);
  });

  it('should rollback unmark on API failure', async () => {
    vi.spyOn(roomApi, 'unmarkSquare').mockRejectedValue(new Error('fail'));

    await component.onSquareUnmark({ row: 0, column: 1 });

    expect(store.players()[0].card!.squares[1].isMarked).toBe(true);
    expect(store.players()[0].card!.squares[1].markedBy).toBe('Player');
  });

  it('should call endGame API', async () => {
    const endSpy = vi.spyOn(roomApi, 'endGame').mockResolvedValue();

    component.onEndGame();
    await component.onConfirmEndGame();

    expect(endSpy).toHaveBeenCalledWith('r1');
    expect(component.isEnding()).toBe(false);
  });

  it('should handle endGame failure', async () => {
    vi.spyOn(roomApi, 'endGame').mockRejectedValue(new Error('fail'));

    component.onEndGame();
    await component.onConfirmEndGame();

    expect(component.isEnding()).toBe(false);
  });

  it('should start with players collapsed', () => {
    expect(component.playersExpanded()).toBe(false);
  });
});
