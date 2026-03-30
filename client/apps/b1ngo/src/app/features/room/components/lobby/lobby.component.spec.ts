import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { LobbyComponent } from './lobby.component';
import { ROOM_STORE } from '../../services/room-store.token';
import { RoomStore } from '../../services/room.store';
import { RoomApiService } from '@core/api/room-api.service';
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
              displayText: 'Editable',
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

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let store: RoomStore;
  let roomApi: RoomApiService;

  beforeEach(async () => {
    store = new RoomStore();
    store.initialize(mockRoomState(), 'p1');

    await TestBed.configureTestingModule({
      imports: [LobbyComponent],
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

    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    roomApi = TestBed.inject(RoomApiService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call startGame API on start', async () => {
    const startSpy = vi.spyOn(roomApi, 'startGame').mockResolvedValue();
    await component.onStartGame();
    expect(startSpy).toHaveBeenCalledWith('r1');
    expect(component.isStarting()).toBe(false);
  });

  it('should handle startGame failure', async () => {
    vi.spyOn(roomApi, 'startGame').mockRejectedValue(new Error('fail'));
    await component.onStartGame();
    expect(component.isStarting()).toBe(false);
  });

  it('should open edit sheet on square edit', () => {
    component.onSquareEdit({ row: 0, column: 1 });
    expect(component.editSheetOpen()).toBe(true);
    expect(component.editingSquareText()).toBe('Editable');
  });

  it('should save square edit and update store', async () => {
    vi.spyOn(roomApi, 'editSquare').mockResolvedValue();
    component.onSquareEdit({ row: 0, column: 0 });
    component.editingSquareText.set('Updated text');

    await component.onSaveSquareEdit();

    expect(component.editSheetOpen()).toBe(false);
    expect(store.players()[0].card!.squares[0].displayText).toBe('Updated text');
  });

  it('should handle save square failure', async () => {
    vi.spyOn(roomApi, 'editSquare').mockRejectedValue(new Error('fail'));
    component.onSquareEdit({ row: 0, column: 0 });
    component.editingSquareText.set('Will fail');

    await component.onSaveSquareEdit();

    expect(component.editSheetOpen()).toBe(true);
    expect(component.editingSaving()).toBe(false);
  });

  it('should close edit sheet', () => {
    component.editSheetOpen.set(true);
    component.onEditSheetClosed();
    expect(component.editSheetOpen()).toBe(false);
  });
});
