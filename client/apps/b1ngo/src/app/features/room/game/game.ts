import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  BngCardComponent,
  BngMatrixComponent,
  BngPlayerListComponent,
  BngLeaderboardComponent,
  BngButtonComponent,
  ToastService,
} from 'bng-ui';
import { ROOM_STORE } from '../room';
import { RoomApiService } from '../../../core/api/room-api.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BngCardComponent,
    BngMatrixComponent,
    BngPlayerListComponent,
    BngLeaderboardComponent,
    BngButtonComponent,
  ],
})
export class Game {
  readonly store = inject(ROOM_STORE);
  private readonly roomApi = inject(RoomApiService);
  private readonly toast = inject(ToastService);

  readonly isEnding = signal(false);
  readonly playersExpanded = signal(false);

  readonly winningSquares = computed(() => {
    const set = new Set<string>();
    const leaderboard = this.store.leaderboard();
    const currentId = this.store.currentPlayerId();
    const entry = leaderboard.find((e) => e.playerId === currentId);
    if (!entry) return set;

    const card = this.store.currentCard();
    if (!card) return set;

    for (const square of card.squares) {
      if (square.isMarked) {
        set.add(`${square.row},${square.column}`);
      }
    }
    return set;
  });

  async onSquareMark(event: { row: number; column: number }): Promise<void> {
    const playerId = this.store.currentPlayerId();

    this.store.updateSquare(playerId, event.row, event.column, {
      isMarked: true,
      markedBy: 'Player',
    });
    this.store.recordMarkTimestamp(event.row, event.column);

    try {
      await this.roomApi.markSquare(
        this.store.roomId(),
        playerId,
        event.row,
        event.column,
      );
    } catch {
      this.store.updateSquare(playerId, event.row, event.column, {
        isMarked: false,
        markedBy: null,
      });
      this.toast.error('Failed to mark square. Try again.');
    }
  }

  async onSquareUnmark(event: { row: number; column: number }): Promise<void> {
    const playerId = this.store.currentPlayerId();

    this.store.updateSquare(playerId, event.row, event.column, {
      isMarked: false,
      markedBy: null,
    });
    this.store.recordMarkTimestamp(event.row, event.column);

    try {
      await this.roomApi.unmarkSquare(
        this.store.roomId(),
        playerId,
        event.row,
        event.column,
      );
    } catch {
      this.store.updateSquare(playerId, event.row, event.column, {
        isMarked: true,
        markedBy: 'Player',
      });
      this.toast.error('Failed to unmark square. Try again.');
    }
  }

  async onEndGame(): Promise<void> {
    this.isEnding.set(true);
    try {
      await this.roomApi.endGame(this.store.roomId());
    } catch {
      this.toast.error('Failed to end game.');
    } finally {
      this.isEnding.set(false);
    }
  }

  togglePlayers(): void {
    this.playersExpanded.update((v) => !v);
  }
}
