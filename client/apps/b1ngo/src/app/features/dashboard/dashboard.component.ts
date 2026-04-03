import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngButtonComponent,
  BngStatusBadgeComponent,
  BngSkeletonComponent,
  ToastService,
} from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';
import { UserActivityApiService } from '@core/api/user-activity-api.service';
import { SessionService } from '@core/auth/session.service';
import { DashboardResponse } from '@core/api/models';
import { formatWinRate } from '@core/utils/format.util';
import { safeAsync } from '@core/utils/safe-async.util';
import { CreateRoomFormComponent } from '../home/components/create-room-form/create-room-form.component';
import { JoinRoomFormComponent } from '../home/components/join-room-form/join-room-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BngCardComponent,
    BngButtonComponent,
    BngStatusBadgeComponent,
    BngSkeletonComponent,
    DatePipe,
    RouterLink,
    CreateRoomFormComponent,
    JoinRoomFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly api = inject(UserActivityApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<DashboardResponse | null>(null);

  readonly displayName = signal('');

  async ngOnInit(): Promise<void> {
    this.handleOAuthCallback();
    this.displayName.set(this.auth.currentUser()?.displayName ?? '');
    await this.load();
  }

  private handleOAuthCallback(): void {
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

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    const result = await safeAsync(this.api.getDashboard());

    if (result.ok) {
      this.data.set(result.value);
      this.displayName.set(result.value.displayName);
    } else {
      this.error.set(true);
    }

    this.loading.set(false);
  }

  readonly formatWinRate = formatWinRate;

  rejoin(room: DashboardResponse['activeRooms'][number]): void {
    this.session.enterRoom(room.roomId, room.playerId, room.gpName, room.sessionType);
  }

  onRoomCreated(event: { roomId: string; playerId: string }): void {
    this.session.enterRoom(event.roomId, event.playerId);
  }

  onRoomJoined(event: { roomId: string; playerId: string }): void {
    this.session.enterRoom(event.roomId, event.playerId);
  }
}
