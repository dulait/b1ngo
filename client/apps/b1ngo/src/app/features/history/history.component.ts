import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  BngCardComponent,
  BngButtonComponent,
  BngStatusBadgeComponent,
  BngSkeletonComponent,
} from 'bng-ui';
import { UserActivityApiService } from '@core/api/user-activity-api.service';
import { SessionService } from '@core/auth/session.service';
import { ActiveRoomDto, CompletedRoomDto } from '@core/api/models';
import { ordinal } from '@core/utils/format.util';
import { safeAsync } from '@core/utils/safe-async.util';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    BngCardComponent,
    BngButtonComponent,
    BngStatusBadgeComponent,
    BngSkeletonComponent,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  private readonly api = inject(UserActivityApiService);
  private readonly session = inject(SessionService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly activeRooms = signal<ActiveRoomDto[]>([]);
  readonly completedRooms = signal<CompletedRoomDto[]>([]);
  readonly hasNextPage = signal(false);
  readonly loadingMore = signal(false);
  private currentPage = 1;

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && !this.activeRooms().length && !this.completedRooms().length,
  );

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.currentPage = 1;

    const result = await safeAsync(this.api.getHistory(1, 10));

    if (result.ok) {
      this.activeRooms.set(result.value.activeRooms);
      this.completedRooms.set(result.value.completedRooms.items);
      this.hasNextPage.set(result.value.completedRooms.hasNextPage);
    } else {
      this.error.set(true);
    }

    this.loading.set(false);
  }

  async loadMore(): Promise<void> {
    if (this.loadingMore()) {
      return;
    }

    this.loadingMore.set(true);
    this.currentPage++;

    const result = await safeAsync(this.api.getHistory(this.currentPage, 10));

    if (result.ok) {
      this.completedRooms.update((rooms) => [...rooms, ...result.value.completedRooms.items]);
      this.hasNextPage.set(result.value.completedRooms.hasNextPage);
    } else {
      this.currentPage--;
    }

    this.loadingMore.set(false);
  }

  rejoin(room: ActiveRoomDto): void {
    this.session.enterRoom(room.roomId, room.playerId, room.gpName, room.sessionType);
  }

  readonly ordinal = ordinal;
}
