import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  OnInit,
  OnDestroy,
  InjectionToken,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomApiService } from '../../core/api/room-api.service';
import { SignalRService } from '../../core/realtime/signalr.service';
import { AuthService } from '../../core/auth/auth.service';
import { BngHeaderComponent, BngSkeletonComponent, ToastService } from 'bng-ui';
import { RoomStore } from './room-store';
import { Lobby } from './lobby/lobby';
import { Game } from './game/game';
import { Results } from './results/results';

export const ROOM_STORE = new InjectionToken<RoomStore>('RoomStore');

@Component({
  selector: 'app-room',
  templateUrl: './room.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BngHeaderComponent, BngSkeletonComponent, Lobby, Game, Results],
  providers: [
    {
      provide: ROOM_STORE,
      useFactory: () => new RoomStore(),
    },
  ],
})
export class Room implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly roomApi = inject(RoomApiService);
  private readonly signalr = inject(SignalRService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly store = inject(ROOM_STORE);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.wireSignalREvents();
    this.wireConnectionState();
  }

  async ngOnInit(): Promise<void> {
    const roomId = this.route.snapshot.params['roomId'];

    try {
      const state = await this.roomApi.getRoomState(roomId);
      this.store.initialize(state, this.auth.getPlayerId());
      await this.signalr.connect(roomId);
    } catch {
      this.error.set('Failed to load room.');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.signalr.disconnect();
  }

  private wireSignalREvents(): void {
    effect(() => {
      const event = this.signalr.playerJoined();
      if (event) {
        this.store.addPlayer(event.player);
        this.toast.info(`${event.player.displayName} joined.`);
      }
    });

    effect(() => {
      const event = this.signalr.gameStarted();
      if (event) {
        this.store.setStatus('Active');
        this.toast.info('The game has started!');
      }
    });

    effect(() => {
      const event = this.signalr.squareMarked();
      if (event && !this.store.isRecentOptimisticUpdate(event.row, event.column)) {
        this.store.updateSquare(event.playerId, event.row, event.column, {
          isMarked: true,
          markedBy: event.markedBy,
          markedAt: event.markedAt,
        });
      }
    });

    effect(() => {
      const event = this.signalr.squareUnmarked();
      if (event && !this.store.isRecentOptimisticUpdate(event.row, event.column)) {
        this.store.updateSquare(event.playerId, event.row, event.column, {
          isMarked: false,
          markedBy: null,
          markedAt: null,
        });
      }
    });

    effect(() => {
      const event = this.signalr.bingoAchieved();
      if (event) {
        this.store.updateLeaderboard(event.leaderboard);
        if (event.playerId === this.store.currentPlayerId()) {
          this.toast.success('BINGO! You won!');
        } else {
          this.toast.info(`${event.displayName} got BINGO!`);
        }
      }
    });

    effect(() => {
      const event = this.signalr.gameCompleted();
      if (event) {
        this.store.setStatus('Completed');
        this.store.updateLeaderboard(event.leaderboard);
        this.toast.info('Game over!');
      }
    });
  }

  private wireConnectionState(): void {
    effect(() => {
      const state = this.signalr.connectionState();
      if (state === 'reconnecting') {
        this.toast.warning('Connection lost. Reconnecting...');
      }
    });
  }
}
