import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ToastService } from 'bng-ui';
import { Results } from './results';
import { ROOM_STORE } from '../room';
import { RoomStore } from '../room-store';
import { AuthService } from '../../../core/auth/auth.service';
import { ENVIRONMENT } from '../../../core/environment';
import { GetRoomStateResponse } from '../../../shared/types/api.types';

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
        completedAt: '2026-03-19T00:01:00Z',
      },
    ],
  };
}

describe('Results', () => {
  let component: Results;
  let fixture: ComponentFixture<Results>;
  let store: RoomStore;
  let router: Router;
  let authService: AuthService;
  let toastService: ToastService;

  beforeEach(async () => {
    localStorage.clear();
    store = new RoomStore();
    store.initialize(mockRoomState(), 'p1');

    await TestBed.configureTestingModule({
      imports: [Results],
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

    fixture = TestBed.createComponent(Results);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    toastService = TestBed.inject(ToastService);
    authService.saveSession('r1', 'p1');
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
