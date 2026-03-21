import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import {
  BngCardComponent,
  BngMatrixComponent,
  BngPlayerListComponent,
  BngLeaderboardComponent,
  BngButtonComponent,
  BngBottomSheetComponent,
  BngCollapsibleComponent,
} from 'bng-ui';
import { ROOM_STORE } from '../room';
import { RoomApiService } from '../../../core/api/room-api.service';
import { safeAsync } from '../../../core/api/safe-async';

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
    BngBottomSheetComponent,
    BngCollapsibleComponent,
  ],
})
export class Game {
  readonly store = inject(ROOM_STORE);
  private readonly roomApi = inject(RoomApiService);

  readonly isEnding = signal(false);
  readonly endGameSheetOpen = signal(false);
  readonly playersExpanded = signal(false);

  readonly winningSquares = computed(() => {
    const currentId = this.store.currentPlayerId();
    const entry = this.store.leaderboard().find((e) => e.playerId === currentId);
    if (!entry || !entry.winningSquares) {
      return new Set<string>();
    }

    return new Set(entry.winningSquares.map((s) => `${s.row},${s.column}`));
  });

  async onSquareMark(event: { row: number; column: number }): Promise<void> {
    const playerId = this.store.currentPlayerId();

    this.store.updateSquare(playerId, event.row, event.column, {
      isMarked: true,
      markedBy: 'Player',
    });
    this.store.recordMarkTimestamp(event.row, event.column);

    const result = await safeAsync(
      this.roomApi.markSquare(this.store.roomId(), playerId, event.row, event.column),
    );

    if (!result.ok) {
      this.store.updateSquare(playerId, event.row, event.column, {
        isMarked: false,
        markedBy: null,
      });
    }
  }

  async onSquareUnmark(event: { row: number; column: number }): Promise<void> {
    const playerId = this.store.currentPlayerId();

    this.store.updateSquare(playerId, event.row, event.column, {
      isMarked: false,
      markedBy: null,
    });
    this.store.recordMarkTimestamp(event.row, event.column);

    const result = await safeAsync(
      this.roomApi.unmarkSquare(this.store.roomId(), playerId, event.row, event.column),
    );

    if (!result.ok) {
      this.store.updateSquare(playerId, event.row, event.column, {
        isMarked: true,
        markedBy: 'Player',
      });
    }
  }

  onEndGame(): void {
    this.endGameSheetOpen.set(true);
  }

  onCancelEndGame(): void {
    this.endGameSheetOpen.set(false);
  }

  async onConfirmEndGame(): Promise<void> {
    this.isEnding.set(true);
    const result = await safeAsync(this.roomApi.endGame(this.store.roomId()));
    if (result.ok) {
      this.endGameSheetOpen.set(false);
      this.store.setStatus('Completed');
    }
    this.isEnding.set(false);
  }
}
