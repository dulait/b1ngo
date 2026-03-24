import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
import { RoomApiService } from './room-api.service';
import { ENVIRONMENT } from '../environment/environment.token';

describe('RoomApiService', () => {
  let service: RoomApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://test-api.example.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: baseUrl } },
      ],
    });
    service = TestBed.inject(RoomApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should POST to /api/v1/rooms for createRoom', async () => {
    const cmd = {
      hostDisplayName: 'Max',
      season: 2026,
      grandPrixName: 'Bahrain Grand Prix',
      sessionType: 'Race' as const,
    };
    const mockResponse = { roomId: 'r1', joinCode: 'ABC123', playerId: 'p1', playerToken: 'tok' };

    const promise = service.createRoom(cmd);
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(cmd);
    req.flush(mockResponse);

    const result = await promise;
    expect(result.roomId).toBe('r1');
    expect(result.joinCode).toBe('ABC123');
  });

  it('should POST to /api/v1/rooms/join for joinRoom', async () => {
    const cmd = { joinCode: 'ABC123', displayName: 'Charles' };
    const mockResponse = {
      roomId: 'r1',
      playerId: 'p2',
      playerToken: 'tok',
      displayName: 'Charles',
    };

    const promise = service.joinRoom(cmd);
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/join`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.playerId).toBe('p2');
  });

  it('should POST to /api/v1/rooms/reconnect for reconnect', async () => {
    const mockResponse = { roomId: 'r1', playerId: 'p1', roomStatus: 'Lobby' };

    const promise = service.reconnect();
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/reconnect`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.roomId).toBe('r1');
  });

  it('should GET room state', async () => {
    const mockResponse = {
      roomId: 'r1',
      joinCode: 'ABC123',
      status: 'Lobby',
      session: { season: 2026, grandPrixName: 'Bahrain', sessionType: 'Race' },
      configuration: { matrixSize: 5, winningPatterns: ['Row'] },
      hostPlayerId: 'p1',
      players: [],
      leaderboard: [],
    };

    const promise = service.getRoomState('r1');
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/r1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.joinCode).toBe('ABC123');
  });

  it('should POST to start game', async () => {
    const promise = service.startGame('r1');
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/r1/start`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await promise;
  });

  it('should POST to mark a square', async () => {
    const promise = service.markSquare('r1', 'p1', 2, 3);
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/r1/players/p1/card/squares/2/3/mark`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await promise;
  });

  it('should POST to unmark a square', async () => {
    const promise = service.unmarkSquare('r1', 'p1', 2, 3);
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/r1/players/p1/card/squares/2/3/unmark`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await promise;
  });

  it('should PUT to edit a square', async () => {
    const promise = service.editSquare('r1', 1, 2, 'New text');
    const req = httpMock.expectOne(`${baseUrl}/api/v1/rooms/r1/players/me/card/squares/1/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ displayText: 'New text' });
    req.flush(null);
    await promise;
  });
});
