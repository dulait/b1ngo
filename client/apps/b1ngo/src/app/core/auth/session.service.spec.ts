import { describe, it, beforeEach, expect } from 'vitest';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    service = new SessionService();
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

  it('should load session from localStorage on construction', () => {
    localStorage.setItem(
      'bng-session',
      JSON.stringify({ roomId: 'r1', playerId: 'p1', playerToken: 'tok' }),
    );

    const freshService = new SessionService();
    expect(freshService.hasSession()).toBe(true);
    expect(freshService.getPlayerId()).toBe('p1');
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('bng-session', 'not-json');

    const freshService = new SessionService();
    expect(freshService.hasSession()).toBe(false);
  });
});
