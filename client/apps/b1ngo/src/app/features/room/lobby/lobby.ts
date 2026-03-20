import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import {
  BngCardComponent,
  BngCodeInputComponent,
  BngMatrixComponent,
  BngPlayerListComponent,
  BngButtonComponent,
  BngBottomSheetComponent,
  BngInputComponent,
  ToastService,
} from 'bng-ui';
import { ROOM_STORE } from '../room';
import { RoomApiService } from '../../../core/api/room-api.service';
import { safeAsync } from '../../../core/api/safe-async';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.html',
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
export class Lobby {
  readonly store = inject(ROOM_STORE);
  private readonly roomApi = inject(RoomApiService);
  private readonly toast = inject(ToastService);

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
    const result = await safeAsync(this.roomApi.startGame(this.store.roomId()));
    if (!result.ok) {
      this.toast.error('Failed to start game.');
    }
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
      this.store.updateSquare(
        this.store.currentPlayerId(),
        this.editingRow,
        this.editingCol,
        { displayText: this.editingSquareText(), eventKey: null },
      );
      this.editSheetOpen.set(false);
    } else {
      this.toast.error('Failed to save square.');
    }
    this.editingSaving.set(false);
  }

  onEditSheetClosed(): void {
    this.editSheetOpen.set(false);
  }
}
