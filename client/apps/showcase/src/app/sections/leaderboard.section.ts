import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngLeaderboardComponent, BngCardComponent, PlayerDto, LeaderboardEntryDto } from 'bng-ui';

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
          [players]="players"
          currentPlayerId="p2"
          variant="compact"
        />
      </bng-card>

      <bng-card header="Full Variant">
        <bng-leaderboard
          [entries]="entries"
          [players]="players"
          currentPlayerId="p2"
          variant="full"
        />
      </bng-card>

      <bng-card header="Empty State">
        <bng-leaderboard [entries]="[]" [players]="players" currentPlayerId="p2" />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardSection {
  readonly players: PlayerDto[] = [
    { playerId: 'p1', displayName: 'Max Verstappen' },
    { playerId: 'p2', displayName: 'Lewis Hamilton' },
    { playerId: 'p3', displayName: 'Lando Norris' },
    { playerId: 'p4', displayName: 'Charles Leclerc' },
  ];

  readonly entries: LeaderboardEntryDto[] = [
    {
      rank: 1,
      playerId: 'p4',
      pattern: 'Row',
      completedAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      rank: 2,
      playerId: 'p2',
      pattern: 'Diagonal',
      completedAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      rank: 3,
      playerId: 'p1',
      pattern: 'Column',
      completedAt: new Date(Date.now() - 30000).toISOString(),
    },
  ];
}
