import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomApiService } from '@core/api/room-api.service';
import { AuthService } from '@core/auth/auth.service';
import { safeAsync } from '@core/utils/safe-async.util';
import { CreateRoomFormComponent } from './components/create-room-form/create-room-form.component';
import { JoinRoomFormComponent } from './components/join-room-form/join-room-form.component';

@Component({
  selector: 'app-home',
  imports: [CreateRoomFormComponent, JoinRoomFormComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly roomApi = inject(RoomApiService);
  private readonly auth = inject(AuthService);

  async ngOnInit(): Promise<void> {
    if (!this.auth.hasSession()) {
      return;
    }

    const result = await safeAsync(this.roomApi.reconnect());
    if (result.ok) {
      this.auth.saveSession(result.value.roomId, result.value.playerId, this.auth.getPlayerToken());
      this.router.navigate(['/room', result.value.roomId]);
    } else {
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
