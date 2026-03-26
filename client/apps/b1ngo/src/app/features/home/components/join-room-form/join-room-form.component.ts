import { Component, ChangeDetectionStrategy, inject, output, signal, input, effect, ElementRef } from '@angular/core';
import {
  BngCardComponent,
  BngInputComponent,
  BngCodeInputComponent,
  BngButtonComponent,
} from 'bng-ui';
import { RoomApiService } from '@core/api/room-api.service';
import { safeAsync } from '@core/utils/safe-async.util';

const JOIN_CODE_LENGTH = 6;

@Component({
  selector: 'join-room-form',
  imports: [BngCardComponent, BngInputComponent, BngCodeInputComponent, BngButtonComponent],
  templateUrl: './join-room-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinRoomFormComponent {
  private readonly roomApi = inject(RoomApiService);
  readonly hostElement = inject(ElementRef).nativeElement as HTMLElement;

  readonly defaultDisplayName = input('');
  success = output<{ roomId: string; playerId: string; playerToken: string }>();

  readonly joinCode = signal('');
  readonly displayName = signal('');
  readonly loading = signal(false);
  readonly nameError = signal<string | null>(null);
  readonly codeError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const defaultName = this.defaultDisplayName();
      if (defaultName && !this.displayName()) {
        this.displayName.set(defaultName);
      }
    });
  }

  onCodeChange(value: string): void {
    this.joinCode.set(value);
    if (this.codeError()) {
      this.codeError.set(null);
    }
  }

  onCodeComplete(code: string): void {
    this.joinCode.set(code);
    this.codeError.set(null);
  }

  onNameChange(value: string): void {
    this.displayName.set(value);
    if (this.nameError()) {
      this.validateName();
    }
  }

  async onSubmit(): Promise<void> {
    const codeValid = this.validateCode();
    const nameValid = this.validateName();
    if (!codeValid || !nameValid || this.loading()) {
      return;
    }

    this.loading.set(true);
    const result = await safeAsync(
      this.roomApi.joinRoom({
        joinCode: this.joinCode(),
        displayName: this.displayName().trim(),
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

  private validateCode(): boolean {
    if (this.joinCode().length !== JOIN_CODE_LENGTH) {
      this.codeError.set('Enter a 6-character join code.');
      return false;
    }
    this.codeError.set(null);
    return true;
  }

  private validateName(): boolean {
    const name = this.displayName().trim();
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
