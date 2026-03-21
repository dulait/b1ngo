import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import { BngPlayerChipComponent } from '../player-chip/player-chip.component';
import { PlayerDto } from '../../types';

@Component({
  selector: 'bng-player-list',
  standalone: true,
  imports: [BngPlayerChipComponent],
  template: `
    <div role="list" aria-label="Players in this room" class="space-y-2">
      @for (player of sortedPlayers(); track player.playerId) {
        <div role="listitem" [attr.data-testid]="'player-chip-' + player.displayName">
          <bng-player-chip
            [displayName]="player.displayName"
            [isHost]="player.playerId === hostPlayerId()"
            [isCurrentPlayer]="player.playerId === currentPlayerId()"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngPlayerListComponent {
  players = input<PlayerDto[]>([]);
  hostPlayerId = input('');
  currentPlayerId = input('');

  protected sortedPlayers = computed(() => {
    const all = this.players();
    const hostId = this.hostPlayerId();
    const host = all.find((p) => p.playerId === hostId);
    const others = all.filter((p) => p.playerId !== hostId);
    return host ? [host, ...others] : [...others];
  });
}
