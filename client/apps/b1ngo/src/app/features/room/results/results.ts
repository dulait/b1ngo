import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  BngCardComponent,
  BngMatrixComponent,
  BngLeaderboardComponent,
  BngButtonComponent,
} from 'bng-ui';
import { ROOM_STORE } from '../room';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BngCardComponent,
    BngMatrixComponent,
    BngLeaderboardComponent,
    BngButtonComponent,
  ],
})
export class Results {
  readonly store = inject(ROOM_STORE);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly currentRank = computed(() => {
    const entry = this.store.leaderboard().find(
      (entry) => entry.playerId === this.store.currentPlayerId(),
    );
    return entry?.rank ?? null;
  });

  readonly winningSquares = computed(() => {
    const currentId = this.store.currentPlayerId();
    const entry = this.store.leaderboard().find((e) => e.playerId === currentId);
    if (!entry || !entry.winningSquares) return new Set<string>();
    return new Set(entry.winningSquares.map((s) => `${s.row},${s.column}`));
  });

  onNewRoom(): void {
    this.auth.clearSession();
    this.router.navigate(['/']);
  }

  async onShareResult(): Promise<void> {
    const rank = this.currentRank();
    const session = this.store.session();
    const text = rank
      ? `I finished #${rank} in B1NGO! ${session?.grandPrixName ?? ''} ${session?.sessionType ?? ''}`
      : `I played B1NGO! ${session?.grandPrixName ?? ''} ${session?.sessionType ?? ''}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }
}
