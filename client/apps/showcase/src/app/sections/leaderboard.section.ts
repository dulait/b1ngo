import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngLeaderboardComponent, BngCardComponent, LeaderboardItem } from 'bng-ui';

@Component({
  selector: 'ds-leaderboard',
  standalone: true,
  imports: [BngLeaderboardComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Leaderboard</h2>
    <p class="text-sm text-text-secondary mb-6">
      Compact and full leaderboard variants, plus an empty state.
    </p>

    <div class="space-y-6">
      <bng-card header="Compact Variant">
        <bng-leaderboard
          [entries]="entries"
          variant="compact"
        />
      </bng-card>

      <bng-card header="Full Variant">
        <bng-leaderboard
          [entries]="entries"
          variant="full"
        />
      </bng-card>

      <bng-card header="Empty State">
        <bng-leaderboard [entries]="[]" />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardSection {
  readonly entries: LeaderboardItem[] = [
    {
      rank: 1,
      displayName: 'Charles Leclerc',
      badge: 'Row',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      isCurrentUser: false,
    },
    {
      rank: 2,
      displayName: 'Lewis Hamilton',
      badge: 'Diagonal',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      isCurrentUser: true,
    },
    {
      rank: 3,
      displayName: 'Max Verstappen',
      badge: 'Column',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      isCurrentUser: false,
    },
  ];
}
