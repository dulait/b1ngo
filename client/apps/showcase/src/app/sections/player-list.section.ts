import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngPlayerListComponent, BngCardComponent, PlayerDto } from 'bng-ui';

@Component({
  selector: 'ds-player-list',
  standalone: true,
  imports: [BngPlayerListComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Player List</h2>
    <p class="text-sm text-text-secondary mb-6">
      Sorted player list with host pinned to the top and current player highlighted.
    </p>

    <bng-card header="Lobby Players">
      <bng-player-list [players]="players" hostPlayerId="p1" currentPlayerId="p2" />
    </bng-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListSection {
  readonly players: PlayerDto[] = [
    { playerId: 'p1', displayName: 'Max Verstappen' },
    { playerId: 'p2', displayName: 'Lewis Hamilton' },
    { playerId: 'p3', displayName: 'Lando Norris' },
    { playerId: 'p4', displayName: 'Charles Leclerc' },
  ];
}
