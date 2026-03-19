import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, BngThemePickerComponent } from 'bng-ui';
import { RoomApiService } from '../../core/api/room-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { CreateRoomForm } from './create-room-form/create-room-form';
import { JoinRoomForm } from './join-room-form/join-room-form';

@Component({
  selector: 'app-home',
  imports: [CreateRoomForm, JoinRoomForm, BngThemePickerComponent],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  private readonly roomApi = inject(RoomApiService);
  private readonly auth = inject(AuthService);
  protected readonly themeService = inject(ThemeService);

  async ngOnInit(): Promise<void> {
    if (!this.auth.hasSession()) {
      return;
    }

    try {
      const result = await this.roomApi.reconnect();
      this.auth.saveSession(result.roomId, result.playerId, this.auth.getPlayerToken());
      this.router.navigate(['/room', result.roomId]);
    } catch {
      this.auth.clearSession();
    }
  }

  onRoomCreated(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.auth.saveSession(event.roomId, event.playerId, event.playerToken);
    this.router.navigate(['/room', event.roomId]);
  }

  onRoomJoined(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.auth.saveSession(event.roomId, event.playerId, event.playerToken);
    this.router.navigate(['/room', event.roomId]);
  }
}
