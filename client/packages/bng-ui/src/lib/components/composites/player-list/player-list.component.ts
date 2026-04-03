import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import { BngPlayerChipComponent } from '../../primitives/player-chip/player-chip.component';
import { PlayerChipItem } from '../../../types';

@Component({
  selector: 'bng-player-list',
  standalone: true,
  imports: [BngPlayerChipComponent],
  template: `
    <div role="list" aria-label="Players in this room" class="space-y-2">
      @for (player of sortedPlayers(); track player.id) {
        <div role="listitem">
          <bng-player-chip
            [displayName]="player.displayName"
            [isHost]="player.isHost"
            [isCurrentPlayer]="player.isCurrentUser"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngPlayerListComponent {
  players = input<PlayerChipItem[]>([]);

  protected sortedPlayers = computed(() => {
    const all = this.players();
    const host = all.find((p) => p.isHost);
    const others = all.filter((p) => !p.isHost);
    return host ? [host, ...others] : [...others];
  });
}
