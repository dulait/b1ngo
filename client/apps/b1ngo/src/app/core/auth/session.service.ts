import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { SessionInfo } from './session-info.interface';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  readonly session = signal<SessionInfo | null>(this.storage.get('bng-session'));

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
    this.storage.set('bng-session', info);
    this.session.set(info);
  }

  enterRoom(
    roomId: string,
    playerId: string,
    playerToken: string,
    gpName?: string,
    sessionType?: string,
  ): void {
    this.saveSession(roomId, playerId, playerToken, gpName, sessionType);
    this.router.navigate(['/room', roomId]);
  }

  clearSession(): void {
    this.storage.remove('bng-session');
    this.session.set(null);
  }
}
