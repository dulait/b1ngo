import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    service = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  it('should return false for hasSession when no session exists', () => {
    expect(service.hasSession()).toBe(false);
  });

  it('should return empty string for getPlayerId when no session', () => {
    expect(service.getPlayerId()).toBe('');
  });

  it('should save and load session', () => {
    service.saveSession('room-1', 'player-1', 'tok-1');

    expect(service.hasSession()).toBe(true);
    expect(service.getPlayerId()).toBe('player-1');
    expect(service.getRoomId()).toBe('room-1');
    expect(service.getPlayerToken()).toBe('tok-1');
    expect(service.session()).toEqual({
      roomId: 'room-1',
      playerId: 'player-1',
      playerToken: 'tok-1',
    });
  });

  it('should persist session to localStorage', () => {
    service.saveSession('room-1', 'player-1', 'tok-1');

    const stored = localStorage.getItem('bng-session');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual({
      roomId: 'room-1',
      playerId: 'player-1',
      playerToken: 'tok-1',
    });
  });

  it('should clear session', () => {
    service.saveSession('room-1', 'player-1', 'tok-1');
    service.clearSession();

    expect(service.hasSession()).toBe(false);
    expect(service.session()).toBeNull();
    expect(localStorage.getItem('bng-session')).toBeNull();
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('bng-session', 'not-json');

    const freshService = TestBed.inject(SessionService);
    expect(freshService.hasSession()).toBe(false);
  });

  it('should save gpName and sessionType when provided', () => {
    service.saveSession('r1', 'p1', 'tok', 'Monaco GP', 'Race');

    expect(service.getGpName()).toBe('Monaco GP');
    expect(service.getSessionType()).toBe('Race');
  });

  it('should omit gpName and sessionType when not provided', () => {
    service.saveSession('r1', 'p1', 'tok');

    expect(service.getGpName()).toBe('');
    expect(service.getSessionType()).toBe('');
    const stored = JSON.parse(localStorage.getItem('bng-session')!);
    expect(stored.gpName).toBeUndefined();
  });

  it('should save session and navigate to room on enterRoom', () => {
    service.enterRoom('r1', 'p1', 'tok', 'Monaco GP', 'Race');

    expect(service.hasSession()).toBe(true);
    expect(service.getRoomId()).toBe('r1');
    expect(service.getGpName()).toBe('Monaco GP');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r1']);
  });
});
