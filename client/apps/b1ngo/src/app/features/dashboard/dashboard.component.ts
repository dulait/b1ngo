import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngButtonComponent,
  BngStatusBadgeComponent,
  BngSkeletonComponent,
} from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';
import { UserActivityApiService } from '@core/api/user-activity-api.service';
import { SessionService } from '@core/auth/session.service';
import { DashboardResponse } from '@core/api/models';
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
  private readonly auth = inject(AuthService);
  private readonly api = inject(UserActivityApiService);
  private readonly session = inject(SessionService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<DashboardResponse | null>(null);

  readonly displayName = signal('');

  async ngOnInit(): Promise<void> {
    this.displayName.set(this.auth.currentUser()?.displayName ?? '');
    await this.load();
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

  formatWinRate(rate: number): string {
    return Math.round(rate * 100) + '%';
  }

  rejoin(roomId: string): void {
    this.router.navigate(['/room', roomId]);
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
}
