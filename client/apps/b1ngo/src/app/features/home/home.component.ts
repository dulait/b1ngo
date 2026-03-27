import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomApiService } from '@core/api/room-api.service';
import { SessionService } from '@core/auth/session.service';
import { safeAsync } from '@core/utils/safe-async.util';
import { ToastService } from 'bng-ui';
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
  private readonly route = inject(ActivatedRoute);
  private readonly roomApi = inject(RoomApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  async ngOnInit(): Promise<void> {
    await this.handleOAuthCallback();

    if (!this.session.hasSession()) {
      return;
    }

    const result = await safeAsync(this.roomApi.reconnect());
    if (result.ok) {
      this.session.saveSession(result.value.roomId, result.value.playerId, this.session.getPlayerToken());
      this.router.navigate(['/room', result.value.roomId]);
    } else {
      this.session.clearSession();
    }
  }

  onRoomCreated(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.enterRoom(event);
  }

  onRoomJoined(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.enterRoom(event);
  }

  private enterRoom(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.session.saveSession(event.roomId, event.playerId, event.playerToken);
    this.router.navigate(['/room', event.roomId]);
  }

  private async handleOAuthCallback(): Promise<void> {
    const authParam = this.route.snapshot.queryParamMap.get('auth');
    if (!authParam) {
      return;
    }

    if (authParam === 'success') {
      this.toast.success('Logged in successfully.');
    } else if (authParam === 'error') {
      this.toast.error('External login failed. Please try again.');
    }

    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
