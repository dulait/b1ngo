import { Injectable, signal } from '@angular/core';

interface SessionInfo {
  roomId: string;
  playerId: string;
  playerToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
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
    localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(info));
    this.session.set(info);
  }

  clearSession(): void {
    localStorage.removeItem(AuthService.SESSION_KEY);
    this.session.set(null);
  }

  private loadSession(): SessionInfo | null {
    const raw = localStorage.getItem(AuthService.SESSION_KEY);
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
