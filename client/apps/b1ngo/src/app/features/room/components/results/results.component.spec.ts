import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ToastService } from 'bng-ui';
import { ResultsComponent } from './results.component';
import { ROOM_STORE } from '../../services/room-store.token';
import { RoomStore } from '../../services/room.store';
import { SessionService } from '@core/auth/session.service';
import { ENVIRONMENT } from '@core/environment/environment.token';
import { GetRoomStateResponse } from '@core/api/models/responses';

function mockRoomState(): GetRoomStateResponse {
  return {
    roomId: 'r1',
    joinCode: 'ABC123',
    status: 'Completed',
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
              isMarked: true,
              markedBy: 'Player',
              markedAt: '2026-03-19T00:00:00Z',
            },
          ],
        },
      },
    ],
    leaderboard: [
      {
        rank: 1,
        playerId: 'p1',
        winningPattern: 'Row',
        winningSquares: [{ row: 0, column: 0 }],
        completedAt: '2026-03-19T00:01:00Z',
      },
    ],
  };
}

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let store: RoomStore;
  let router: Router;
  let authService: SessionService;
  let toastService: ToastService;

  beforeEach(async () => {
    localStorage.clear();
    store = new RoomStore();
    store.initialize(mockRoomState(), 'p1');

    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
        { provide: ROOM_STORE, useValue: store },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(SessionService);
    toastService = TestBed.inject(ToastService);
    authService.saveSession('r1', 'p1', 'tok');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should compute current rank from leaderboard', () => {
    expect(component.currentRank()).toBe(1);
  });

  it('should return null rank when player not in leaderboard', () => {
    store.updateLeaderboard([]);
    expect(component.currentRank()).toBeNull();
  });

  it('should compute winning squares from marked squares', () => {
    const squares = component.winningSquares();
    expect(squares.size).toBe(1);
    expect(squares.has('0,0')).toBe(true);
  });

  it('should clear toasts, clear session, and navigate to home on new room', () => {
    const clearSpy = vi.spyOn(toastService, 'clear');
    component.onNewRoom();
    expect(clearSpy).toHaveBeenCalled();
    expect(authService.hasSession()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
