import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  BngCardComponent,
  BngButtonComponent,
  BngStatusBadgeComponent,
  BngSkeletonComponent,
} from 'bng-ui';
import { UserActivityApiService } from '@core/api/user-activity-api.service';
import { ActiveRoomDto, CompletedRoomDto } from '@core/api/models';
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
  private readonly router = inject(Router);
  private readonly api = inject(UserActivityApiService);

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

  rejoin(roomId: string): void {
    this.router.navigate(['/room', roomId]);
  }

  ordinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}
