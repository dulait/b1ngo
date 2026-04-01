import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomApiService } from '@core/api/room-api.service';
import { AuthService } from '@core/auth/auth.service';
import { SessionService } from '@core/auth/session.service';
import { StorageService } from '@core/storage/storage.service';
import { safeAsync } from '@core/utils/safe-async.util';
import { BngBannerComponent, BngButtonComponent, BngModalComponent, ToastService } from 'bng-ui';
import { CreateRoomFormComponent } from './components/create-room-form/create-room-form.component';
import { JoinRoomFormComponent } from './components/join-room-form/join-room-form.component';

@Component({
  selector: 'app-home',
  imports: [
    CreateRoomFormComponent,
    JoinRoomFormComponent,
    BngBannerComponent,
    BngButtonComponent,
    BngModalComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly roomApi = inject(RoomApiService);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  readonly dismissed = signal(this.storage.getString('bng-rejoin-dismissed', 'session') === 'true');
  readonly reconnecting = signal(false);

  readonly showBanner = computed(
    () =>
      !this.auth.isAuthenticated() &&
      this.session.hasSession() &&
      !this.dismissed() &&
      !this.reconnecting(),
  );

  readonly sessionContext = computed(() => {
    const s = this.session.session();
    if (s?.gpName && s?.sessionType) {
      return `${s.gpName} / ${s.sessionType}`;
    }
    return '';
  });

  readonly confirmOpen = signal(false);
  readonly confirmAction = signal('');
  private confirmResolve: ((proceed: boolean) => void) | null = null;

  readonly beforeCreateGuard = (): Promise<boolean> =>
    this.guardSubmit('Creating a new room');
  readonly beforeJoinGuard = (): Promise<boolean> =>
    this.guardSubmit('Joining a different room');

  async ngOnInit(): Promise<void> {
    await this.handleOAuthCallback();

    if (!this.session.hasSession()) {
      return;
    }

    this.reconnecting.set(true);
    const result = await safeAsync(this.roomApi.reconnect());
    this.reconnecting.set(false);

    if (result.ok) {
      this.session.enterRoom(
        result.value.roomId,
        result.value.playerId,
        this.session.getPlayerToken(),
      );
    }
  }

  onDismiss(): void {
    this.dismissed.set(true);
    this.storage.set('bng-rejoin-dismissed', 'true', 'session');
  }

  onRejoin(): void {
    this.router.navigate(['/room', this.session.getRoomId()]);
  }

  onRoomCreated(event: {
    roomId: string;
    playerId: string;
    playerToken: string;
    gpName?: string;
    sessionType?: string;
  }): void {
    this.session.enterRoom(event.roomId, event.playerId, event.playerToken, event.gpName, event.sessionType);
  }

  onRoomJoined(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.session.enterRoom(event.roomId, event.playerId, event.playerToken);
  }

  cancelReplace(): void {
    this.closeConfirm(false);
  }

  confirmReplace(): void {
    this.closeConfirm(true);
  }

  private closeConfirm(proceed: boolean): void {
    this.confirmOpen.set(false);
    this.confirmResolve?.(proceed);
    this.confirmResolve = null;
  }

  private guardSubmit(action: string): Promise<boolean> {
    if (this.auth.isAuthenticated() || !this.session.hasSession()) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      this.confirmAction.set(action);
      this.confirmResolve = resolve;
      this.confirmOpen.set(true);
    });
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
