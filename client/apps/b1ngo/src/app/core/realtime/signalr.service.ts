import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ENVIRONMENT } from '../environment';
import { AuthService } from '../auth/auth.service';
import {
  PlayerJoinedEvent,
  GameStartedEvent,
  SquareMarkedEvent,
  SquareUnmarkedEvent,
  BingoAchievedEvent,
  BingoRevokedEvent,
  GameCompletedEvent,
} from '../../shared/types/api.types';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: HubConnection | null = null;
  private readonly baseUrl = inject(ENVIRONMENT).apiBaseUrl;
  private readonly auth = inject(AuthService);

  readonly playerJoined = signal<PlayerJoinedEvent | null>(null);
  readonly gameStarted = signal<GameStartedEvent | null>(null);
  readonly squareMarked = signal<SquareMarkedEvent | null>(null);
  readonly squareUnmarked = signal<SquareUnmarkedEvent | null>(null);
  readonly bingoAchieved = signal<BingoAchievedEvent | null>(null);
  readonly bingoRevoked = signal<BingoRevokedEvent | null>(null);
  readonly gameCompleted = signal<GameCompletedEvent | null>(null);

  readonly connectionState = signal<ConnectionState>('disconnected');
  readonly reconnectedAt = signal<number | null>(null);

  async connect(roomId: string): Promise<void> {
    await this.disconnect();

    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/game?roomId=${roomId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    this.registerHandlers();
    this.registerLifecycleEvents();

    this.connectionState.set('connecting');
    await this.connection.start();
    this.connectionState.set('connected');
  }

  async disconnect(): Promise<void> {
    const conn = this.connection;
    this.connection = null;
    this.resetSignals();
    this.connectionState.set('disconnected');

    if (conn) {
      try {
        await conn.stop();
      } catch {
        // Connection may already be stopped; safe to ignore
      }
    }
  }

  private resetSignals(): void {
    this.playerJoined.set(null);
    this.gameStarted.set(null);
    this.squareMarked.set(null);
    this.squareUnmarked.set(null);
    this.bingoAchieved.set(null);
    this.bingoRevoked.set(null);
    this.gameCompleted.set(null);
  }

  private registerHandlers(): void {
    const conn = this.connection!;
    conn.on('PlayerJoined', (data) => this.playerJoined.set(data));
    conn.on('GameStarted', (data) => this.gameStarted.set(data));
    conn.on('SquareMarked', (data) => this.squareMarked.set(data));
    conn.on('SquareUnmarked', (data) => this.squareUnmarked.set(data));
    conn.on('BingoAchieved', (data) => this.bingoAchieved.set(data));
    conn.on('BingoRevoked', (data) => this.bingoRevoked.set(data));
    conn.on('GameCompleted', (data) => this.gameCompleted.set(data));
  }

  private registerLifecycleEvents(): void {
    const conn = this.connection!;
    conn.onreconnecting(() => this.connectionState.set('reconnecting'));
    conn.onreconnected(() => {
      this.connectionState.set('connected');
      this.reconnectedAt.set(Date.now());
    });
    conn.onclose(() => this.connectionState.set('disconnected'));
  }
}
