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

  getGpName(): string {
    return this.session()?.gpName ?? '';
  }

  getSessionType(): string {
    return this.session()?.sessionType ?? '';
  }

  saveSession(
    roomId: string,
    playerId: string,
    playerToken: string,
    gpName?: string,
    sessionType?: string,
  ): void {
    const info: SessionInfo = { roomId, playerId, playerToken };
    if (gpName) {
      info.gpName = gpName;
    }
    if (sessionType) {
      info.sessionType = sessionType;
    }
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
