import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import {
  BngCardComponent,
  BngCodeInputComponent,
  BngMatrixComponent,
  BngPlayerListComponent,
  BngButtonComponent,
  BngBottomSheetComponent,
  BngInputComponent,
} from 'bng-ui';
import { ROOM_STORE } from '../../services/room-store.token';
import { RoomApiService } from '@core/api/room-api.service';
import { safeAsync } from '@core/utils/safe-async.util';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BngCardComponent,
    BngCodeInputComponent,
    BngMatrixComponent,
    BngPlayerListComponent,
    BngButtonComponent,
    BngBottomSheetComponent,
    BngInputComponent,
  ],
})
export class LobbyComponent {
  readonly store = inject(ROOM_STORE);
  private readonly roomApi = inject(RoomApiService);

  readonly emptySet = new Set<string>();
  readonly isStarting = signal(false);
  readonly editSheetOpen = signal(false);
  readonly editingSquareText = signal('');
  readonly editingSquareCurrentText = signal('');
  readonly editingSquareHasEventKey = signal(false);
  readonly editingSaving = signal(false);

  private editingRow = 0;
  private editingCol = 0;

  async onStartGame(): Promise<void> {
    this.isStarting.set(true);
    await safeAsync(this.roomApi.startGame(this.store.roomId()));
    this.isStarting.set(false);
  }

  onSquareEdit(event: { row: number; column: number }): void {
    const card = this.store.currentCard();
    if (!card) {
      return;
    }

    const square = card.squares.find(
      (square) => square.row === event.row && square.column === event.column,
    );
    this.editingRow = event.row;
    this.editingCol = event.column;
    this.editingSquareCurrentText.set(square?.displayText ?? '');
    this.editingSquareHasEventKey.set(!!square?.eventKey);
    this.editingSquareText.set(square?.displayText ?? '');
    this.editSheetOpen.set(true);
  }

  async onSaveSquareEdit(): Promise<void> {
    this.editingSaving.set(true);
    const result = await safeAsync(
      this.roomApi.editSquare(
        this.store.roomId(),
        this.editingRow,
        this.editingCol,
        this.editingSquareText(),
      ),
    );
    if (result.ok) {
      this.store.updateSquare(this.store.currentPlayerId(), this.editingRow, this.editingCol, {
        displayText: this.editingSquareText(),
        eventKey: null,
      });
      this.editSheetOpen.set(false);
    }
    this.editingSaving.set(false);
  }

  onEditSheetClosed(): void {
    this.editSheetOpen.set(false);
  }
}
