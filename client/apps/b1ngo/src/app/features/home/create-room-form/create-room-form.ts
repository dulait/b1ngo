import {
  Component,
  ChangeDetectionStrategy,
  inject,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import {
  BngCardComponent,
  BngInputComponent,
  BngSelectComponent,
  BngButtonComponent,
  BngPillToggleComponent,
  PillToggleOption,
} from 'bng-ui';
import { RoomApiService } from '../../../core/api/room-api.service';
import { ReferenceDataService } from '../../../core/api/reference-data.service';
import { safeAsync } from '../../../core/api/safe-async';
import { SessionType, WinPatternType } from '../../../shared/types/api.types';

@Component({
  selector: 'create-room-form',
  imports: [
    BngCardComponent,
    BngInputComponent,
    BngSelectComponent,
    BngButtonComponent,
    BngPillToggleComponent,
  ],
  templateUrl: './create-room-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoomForm {
  private readonly roomApi = inject(RoomApiService);
  private readonly refData = inject(ReferenceDataService);

  success = output<{ roomId: string; playerId: string; playerToken: string }>();

  readonly hostDisplayName = signal('');
  readonly season = signal('2026');
  readonly grandPrixName = signal('Bahrain Grand Prix');
  readonly sessionType = signal<string>('Race');
  readonly loading = signal(false);
  readonly nameError = signal<string | null>(null);
  readonly showAdvanced = signal(false);
  readonly matrixSize = signal(5);
  readonly winningPatterns = signal<PillToggleOption[]>([
    { value: 'Row', label: 'Row', selected: true },
    { value: 'Column', label: 'Column', selected: true },
    { value: 'Diagonal', label: 'Diagonal', selected: true },
    { value: 'Blackout', label: 'Blackout', selected: false },
  ]);

  protected readonly sessionTypeOptions = computed(() =>
    this.refData.sessionTypes().map((st) => ({ value: st.name, label: st.displayName })),
  );
  protected readonly seasonOptions = computed(() =>
    this.refData.seasons().map((s) => ({ value: String(s), label: String(s) })),
  );
  protected readonly grandPrixOptions = computed(() =>
    this.refData
      .grandPrixBySeason(parseInt(this.season(), 10))()
      .map((gp) => ({ value: gp.name, label: gp.name })),
  );
  protected readonly matrixSizes = [3, 5, 7, 9];

  constructor() {
    this.refData.load();

    effect(() => {
      const seasons = this.refData.seasons();
      if (seasons.length > 0 && !this.season()) {
        this.season.set(String(seasons[0]));
      }
    });
  }

  onSeasonChange(value: string): void {
    this.season.set(value);
    const gps = this.refData.grandPrixBySeason(parseInt(value, 10))();
    if (gps.length > 0) {
      this.grandPrixName.set(gps[0].name);
    }
  }

  toggleAdvanced(): void {
    this.showAdvanced.update((v) => !v);
  }

  setMatrixSize(size: number): void {
    this.matrixSize.set(size);
  }

  onPatternToggled(value: string): void {
    this.winningPatterns.update((patterns) =>
      patterns.map((p) => (p.value === value ? { ...p, selected: !p.selected } : p)),
    );
  }

  onNameChange(value: string): void {
    this.hostDisplayName.set(value);
    if (this.nameError()) {
      this.validateName();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.validateName() || this.loading()) {
      return;
    }

    this.loading.set(true);
    const selectedPatterns = this.winningPatterns()
      .filter((p) => p.selected)
      .map((p) => p.value as WinPatternType);

    const result = await safeAsync(
      this.roomApi.createRoom({
        hostDisplayName: this.hostDisplayName().trim(),
        season: parseInt(this.season(), 10),
        grandPrixName: this.grandPrixName(),
        sessionType: this.sessionType() as SessionType,
        matrixSize: this.matrixSize(),
        winningPatterns: selectedPatterns,
      }),
    );
    if (result.ok) {
      this.success.emit({
        roomId: result.value.roomId,
        playerId: result.value.playerId,
        playerToken: result.value.playerToken,
      });
    }
    this.loading.set(false);
  }

  private validateName(): boolean {
    const name = this.hostDisplayName().trim();
    if (!name) {
      this.nameError.set('Name is required.');
      return false;
    }
    if (name.length > 50) {
      this.nameError.set('Name must be 50 characters or less.');
      return false;
    }
    this.nameError.set(null);
    return true;
  }
}
