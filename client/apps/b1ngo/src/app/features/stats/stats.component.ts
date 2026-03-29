import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { BngCardComponent, BngButtonComponent, BngSkeletonComponent } from 'bng-ui';
import { UserActivityApiService } from '@core/api/user-activity-api.service';
import { StatsResponse } from '@core/api/models';
import { formatWinRate, ordinal } from '@core/utils/format.util';
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

  readonly formatWinRate = formatWinRate;
  readonly ordinal = ordinal;
}
