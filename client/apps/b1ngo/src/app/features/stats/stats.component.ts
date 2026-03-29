import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { BngCardComponent, BngButtonComponent, BngSkeletonComponent } from 'bng-ui';
import { UserActivityApiService } from '@core/api/user-activity-api.service';
import { StatsResponse } from '@core/api/models';
import { safeAsync } from '@core/utils/safe-async.util';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [BngCardComponent, BngButtonComponent, BngSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats.component.html',
})
export class StatsComponent implements OnInit {
  private readonly api = inject(UserActivityApiService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<StatsResponse | null>(null);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    const result = await safeAsync(this.api.getStats());

    if (result.ok) {
      this.data.set(result.value);
    } else {
      this.error.set(true);
    }

    this.loading.set(false);
  }

  formatWinRate(rate: number): string {
    return Math.round(rate * 100) + '%';
  }

  ordinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}
