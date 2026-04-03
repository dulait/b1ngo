import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomApiService } from '@core/api/room-api.service';
import { SessionService } from '@core/auth/session.service';
import { safeAsync } from '@core/utils/safe-async.util';
import { BngBannerComponent, BngButtonComponent, ToastService } from 'bng-ui';
import { CreateRoomFormComponent } from './components/create-room-form/create-room-form.component';
import { JoinRoomFormComponent } from './components/join-room-form/join-room-form.component';

@Component({
  selector: 'app-home',
  imports: [
    CreateRoomFormComponent,
    JoinRoomFormComponent,
    BngBannerComponent,
    BngButtonComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly roomApi = inject(RoomApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly showBanner = signal(false);
  readonly dismissed = signal(false);

  async ngOnInit(): Promise<void> {
    await this.handleOAuthCallback();

    if (!this.session.hasSession()) {
      return;
    }

    if (history.state?.fromRoom) {
      this.showBanner.set(true);
      return;
    }

    const result = await safeAsync(this.roomApi.reconnect());

    if (result.ok) {
      this.session.enterRoom(
        result.value.roomId,
        result.value.playerId,
      );
    } else {
      this.showBanner.set(true);
    }
  }

  onDismiss(): void {
    this.showBanner.set(false);
    this.dismissed.set(true);
  }

  onRejoin(): void {
    this.router.navigate(['/room', this.session.getRoomId()]);
  }

  onRoomCreated(event: {
    roomId: string;
    playerId: string;
    gpName?: string;
    sessionType?: string;
  }): void {
    this.session.enterRoom(event.roomId, event.playerId, event.gpName, event.sessionType);
  }

  onRoomJoined(event: { roomId: string; playerId: string }): void {
    this.session.enterRoom(event.roomId, event.playerId);
  }

  private async handleOAuthCallback(): Promise<void> {
    const authParam = this.route.snapshot.queryParamMap.get('auth');
    if (!authParam) {
      return;
    }

    if (authParam === 'success') {
      this.toast.success('Logged in successfully.');
    } else if (authParam === 'email-conflict') {
      this.toast.warning(
        'An account with this email already exists. Please log in with your password first.',
      );
    } else if (authParam === 'error') {
      this.toast.error('External login failed. Please try again.');
    }

    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
