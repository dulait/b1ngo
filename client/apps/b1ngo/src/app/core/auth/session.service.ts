import { Injectable, signal } from '@angular/core';
import { SessionInfo } from './session-info.interface';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private static readonly SESSION_KEY = 'bng-session';

  readonly session = signal<SessionInfo | null>(this.loadSession());

  hasSession(): boolean {
    return this.session() !== null;
  }

  getPlayerId(): string {
    return this.session()?.playerId ?? '';
  }

  getRoomId(): string {
    return this.session()?.roomId ?? '';
  }

  getPlayerToken(): string {
    return this.session()?.playerToken ?? '';
  }

  saveSession(roomId: string, playerId: string, playerToken: string): void {
    const info: SessionInfo = { roomId, playerId, playerToken };
    localStorage.setItem(SessionService.SESSION_KEY, JSON.stringify(info));
    this.session.set(info);
  }

  clearSession(): void {
    localStorage.removeItem(SessionService.SESSION_KEY);
    this.session.set(null);
  }

  private loadSession(): SessionInfo | null {
    const raw = localStorage.getItem(SessionService.SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as SessionInfo;
    } catch {
      return null;
    }
  }
}
