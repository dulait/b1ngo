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
import { RoomApiService } from '@core/api/room-api.service';
import { ReferenceDataService } from '@core/api/reference-data.service';
import { safeAsync } from '@core/utils/safe-async.util';
import { SessionType, WinPatternType } from '@core/api/models';

@Component({
  selector: 'create-room-form',
  imports: [
    BngCardComponent,
    BngInputComponent,
    BngSelectComponent,
    BngButtonComponent,
    BngPillToggleComponent,
  ],
  templateUrl: './create-room-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoomFormComponent {
  private readonly roomApi = inject(RoomApiService);
  private readonly refData = inject(ReferenceDataService);

  success = output<{
    roomId: string;
    playerId: string;
    gpName?: string;
    sessionType?: string;
  }>();

  readonly hostDisplayName = signal('');
  readonly season = signal('');
  readonly grandPrixName = signal('');
  readonly sessionType = signal('');
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

  protected readonly seasonOptions = computed(() =>
    this.refData.seasons().map((s) => ({ value: String(s), label: String(s) })),
  );

  protected readonly grandPrixOptions = computed(() => {
    const session = parseInt(this.season(), 10);
    if (!session) {
      return [];
    }
    return this.refData
      .grandPrixBySeason(session)()
      .map((gp) => ({ value: gp.name, label: gp.name }));
  });

  protected readonly sessionTypeOptions = computed(() => {
    const gpName = this.grandPrixName();
    const session = parseInt(this.season(), 10);
    if (!gpName || !session) {
      return [];
    }
    const gp = this.refData.grandPrix().find((gp) => gp.name === gpName && gp.season === session);
    if (!gp) {
      return [];
    }
    return gp.sessionTypes.map((st) => ({ value: st, label: st }));
  });

  protected readonly matrixSizes = [3, 5];

  constructor() {
    this.refData.load();

    effect(() => {
      const seasons = this.refData.seasons();
      const currentYear = new Date().getFullYear();
      if (seasons.length > 0 && !this.season()) {
        const defaultSeason = seasons.includes(currentYear) ? currentYear : seasons[0];
        this.season.set(String(defaultSeason));
      }
    });
  }

  onSeasonChange(value: string): void {
    this.season.set(value);
    this.grandPrixName.set('');
    this.sessionType.set('');
  }

  onGrandPrixChange(value: string): void {
    this.grandPrixName.set(value);
    this.sessionType.set('');
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

    const gpName = this.grandPrixName();
    const sessionType = this.sessionType();

    const result = await safeAsync(
      this.roomApi.createRoom({
        hostDisplayName: this.hostDisplayName().trim(),
        season: parseInt(this.season(), 10),
        grandPrixName: gpName,
        sessionType: sessionType as SessionType,
        matrixSize: this.matrixSize(),
        winningPatterns: selectedPatterns,
      }),
    );
    if (result.ok) {
      this.success.emit({
        roomId: result.value.roomId,
        playerId: result.value.playerId,
        gpName,
        sessionType,
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
