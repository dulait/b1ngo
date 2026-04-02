import { describe, it, beforeEach, expect } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    service = new StorageService();
  });

  describe('get (JSON)', () => {
    it('should return null for missing key', () => {
      expect(service.get('bng-session')).toBeNull();
    });

    it('should store and retrieve a JSON object', () => {
      const session = { roomId: 'r1', playerId: 'p1', playerToken: 'tok' };
      service.set('bng-session', session);

      expect(service.get('bng-session')).toEqual(session);
    });

    it('should return null for corrupted JSON', () => {
      localStorage.setItem('bng-session', 'not-json');

      expect(service.get('bng-session')).toBeNull();
    });
  });

  describe('getString', () => {
    it('should return null for missing key', () => {
      expect(service.getString('bng-tutorial-completed')).toBeNull();
    });

    it('should return raw string value', () => {
      service.set('bng-tutorial-completed', 'true');

      expect(service.getString('bng-tutorial-completed')).toBe('true');
    });
  });

  describe('remove', () => {
    it('should remove a key from localStorage', () => {
      service.set('bng-session', { roomId: 'r1', playerId: 'p1', playerToken: 'tok' });
      service.remove('bng-session');

      expect(service.get('bng-session')).toBeNull();
    });
  });

  describe('session backend', () => {
    it('should use sessionStorage when backend is session', () => {
      service.set('bng-tutorial-completed', 'true', 'session');

      expect(localStorage.getItem('bng-tutorial-completed')).toBeNull();
      expect(service.getString('bng-tutorial-completed', 'session')).toBe('true');
    });
  });
});
