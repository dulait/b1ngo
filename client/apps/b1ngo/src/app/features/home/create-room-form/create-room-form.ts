import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import {
  BngCardComponent,
  BngInputComponent,
  BngSelectComponent,
  BngButtonComponent,
} from 'bng-ui';
import { RoomApiService } from '../../../core/api/room-api.service';
import { SessionType } from '../../../shared/types/api.types';

const SESSION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'FP1', label: 'FP1' },
  { value: 'FP2', label: 'FP2' },
  { value: 'FP3', label: 'FP3' },
  { value: 'Qualifying', label: 'Qualifying' },
  { value: 'SprintQualifying', label: 'Sprint Qualifying' },
  { value: 'Sprint', label: 'Sprint' },
  { value: 'Race', label: 'Race' },
];

const SEASON_OPTIONS: { value: string; label: string }[] = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];

const GRAND_PRIX_OPTIONS: { value: string; label: string }[] = [
  { value: 'Bahrain Grand Prix', label: 'Bahrain Grand Prix' },
  { value: 'Saudi Arabian Grand Prix', label: 'Saudi Arabian Grand Prix' },
  { value: 'Australian Grand Prix', label: 'Australian Grand Prix' },
  { value: 'Japanese Grand Prix', label: 'Japanese Grand Prix' },
  { value: 'Chinese Grand Prix', label: 'Chinese Grand Prix' },
  { value: 'Miami Grand Prix', label: 'Miami Grand Prix' },
  { value: 'Emilia Romagna Grand Prix', label: 'Emilia Romagna Grand Prix' },
  { value: 'Monaco Grand Prix', label: 'Monaco Grand Prix' },
  { value: 'Spanish Grand Prix', label: 'Spanish Grand Prix' },
  { value: 'Canadian Grand Prix', label: 'Canadian Grand Prix' },
  { value: 'Austrian Grand Prix', label: 'Austrian Grand Prix' },
  { value: 'British Grand Prix', label: 'British Grand Prix' },
  { value: 'Belgian Grand Prix', label: 'Belgian Grand Prix' },
  { value: 'Hungarian Grand Prix', label: 'Hungarian Grand Prix' },
  { value: 'Dutch Grand Prix', label: 'Dutch Grand Prix' },
  { value: 'Italian Grand Prix', label: 'Italian Grand Prix' },
  { value: 'Azerbaijan Grand Prix', label: 'Azerbaijan Grand Prix' },
  { value: 'Singapore Grand Prix', label: 'Singapore Grand Prix' },
  { value: 'United States Grand Prix', label: 'United States Grand Prix' },
  { value: 'Mexico City Grand Prix', label: 'Mexico City Grand Prix' },
  { value: 'Brazilian Grand Prix', label: 'Brazilian Grand Prix' },
  { value: 'Las Vegas Grand Prix', label: 'Las Vegas Grand Prix' },
  { value: 'Qatar Grand Prix', label: 'Qatar Grand Prix' },
  { value: 'Abu Dhabi Grand Prix', label: 'Abu Dhabi Grand Prix' },
];

@Component({
  selector: 'create-room-form',
  imports: [BngCardComponent, BngInputComponent, BngSelectComponent, BngButtonComponent],
  templateUrl: './create-room-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoomForm {
  private readonly roomApi = inject(RoomApiService);

  success = output<{ roomId: string; playerId: string; playerToken: string }>();

  readonly hostDisplayName = signal('');
  readonly season = signal('2026');
  readonly grandPrixName = signal('Bahrain Grand Prix');
  readonly sessionType = signal<string>('Race');
  readonly loading = signal(false);
  readonly nameError = signal<string | null>(null);

  protected readonly sessionTypeOptions = SESSION_TYPE_OPTIONS;
  protected readonly seasonOptions = SEASON_OPTIONS;
  protected readonly grandPrixOptions = GRAND_PRIX_OPTIONS;

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
    try {
      const response = await this.roomApi.createRoom({
        hostDisplayName: this.hostDisplayName().trim(),
        season: parseInt(this.season(), 10),
        grandPrixName: this.grandPrixName(),
        sessionType: this.sessionType() as SessionType,
      });
      this.success.emit({ roomId: response.roomId, playerId: response.playerId, playerToken: response.playerToken });
    } catch {
      // Error interceptor handles toast
    } finally {
      this.loading.set(false);
    }
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
