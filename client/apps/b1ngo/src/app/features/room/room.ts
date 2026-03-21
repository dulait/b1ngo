import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  untracked,
  OnInit,
  OnDestroy,
  InjectionToken,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomApiService } from '../../core/api/room-api.service';
import { SignalRService } from '../../core/realtime/signalr.service';
import { AuthService } from '../../core/auth/auth.service';
import { safeAsync } from '../../core/api/safe-async';
import {
  BngHeaderComponent,
  BngSkeletonComponent,
  BngCardComponent,
  BngButtonComponent,
  ToastService,
} from 'bng-ui';
import { RoomStore } from './room-store';
import { Lobby } from './lobby/lobby';
import { Game } from './game/game';
import { Results } from './results/results';

export const ROOM_STORE = new InjectionToken<RoomStore>('RoomStore');

@Component({
  selector: 'app-room',
  templateUrl: './room.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BngHeaderComponent,
    BngSkeletonComponent,
    BngCardComponent,
    BngButtonComponent,
    Lobby,
    Game,
    Results,
  ],
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
  readonly error = signal(false);
  private destroyed = false;

  constructor() {
    this.wireSignalREvents();
    this.wireConnectionState();
  }

  async ngOnInit(): Promise<void> {
    const roomId = this.route.snapshot.params['roomId'];

    const result = await safeAsync(this.roomApi.getRoomState(roomId));
    this.loading.set(false);

    if (!result.ok) {
      this.error.set(true);
      return;
    }

    this.store.initialize(result.value, this.auth.getPlayerId());

    await this.signalr.connect(roomId).catch(() => {
      console.warn(
        '[Room] SignalR connection failed; room will function without real-time updates',
      );
    });
  }

  retry(): void {
    this.error.set(false);
    this.loading.set(true);
    this.ngOnInit();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.signalr.disconnect();
  }

  private wireSignalREvents(): void {
    effect(() => {
      const event = this.signalr.playerJoined();
      if (event) {
        this.store.addPlayer(event.playerId, event.displayName);
        this.toast.info(`${event.displayName} joined.`);
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
        untracked(() => {
          this.store.addLeaderboardEntry({
            rank: event.rank,
            playerId: event.playerId,
            winningPattern: event.pattern,
            winningSquares: event.winningSquares,
            completedAt: event.completedAt,
          });
          this.store.setPlayerWon(event.playerId);
          if (event.playerId === this.store.currentPlayerId()) {
            this.toast.success('BINGO! You won!');
          } else {
            const player = this.store.players().find((p) => p.playerId === event.playerId);
            this.toast.info(`${player?.displayName ?? 'A player'} got BINGO!`);
          }
        });
      }
    });

    effect(() => {
      const event = this.signalr.bingoRevoked();
      if (event) {
        untracked(() => {
          this.store.removeLeaderboardEntry(event.playerId);
          this.store.revokePlayerWon(event.playerId);
        });
      }
    });

    effect(() => {
      const event = this.signalr.gameCompleted();
      if (event) {
        this.store.setStatus('Completed');
        this.toast.info('The game is over!');
        this.roomApi.getRoomState(event.roomId).then(
          (state) => {
            if (!this.destroyed) {
              this.store.updateLeaderboard(state.leaderboard);
            }
          },
          () => { },
        );
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
