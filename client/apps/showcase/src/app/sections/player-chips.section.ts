import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngPlayerChipComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-player-chips',
  standalone: true,
  imports: [BngPlayerChipComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Player Chips</h2>
    <p class="text-sm text-text-secondary mb-6">
      Avatar chips for players with host, current player, and winner states.
    </p>

    <bng-card header="Player Chip Variants">
      <div class="space-y-2">
        <bng-player-chip displayName="Max Verstappen" [isHost]="true" />
        <bng-player-chip displayName="Lewis Hamilton" [isCurrentPlayer]="true" />
        <bng-player-chip displayName="Lando Norris" />
        <bng-player-chip displayName="Charles Leclerc" [hasWon]="true" [rank]="1" />
      </div>
    </bng-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerChipsSection {}
