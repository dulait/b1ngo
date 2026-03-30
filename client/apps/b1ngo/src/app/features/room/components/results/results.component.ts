import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  BngCardComponent,
  BngMatrixComponent,
  BngLeaderboardComponent,
  BngButtonComponent,
  ToastService,
} from 'bng-ui';
import type { GridCellData } from 'bng-ui';
import { ROOM_STORE } from '../../services/room-store.token';
import { AuthService } from '@core/auth/auth.service';
import { SessionService } from '@core/auth/session.service';
import { formatMarkedByLabel, markedByVariant } from '../../utils/format-marked-by.util';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BngCardComponent, BngMatrixComponent, BngLeaderboardComponent, BngButtonComponent],
})
export class ResultsComponent {
  readonly store = inject(ROOM_STORE);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly gridCells = computed<GridCellData[]>(() => {
    const card = this.store.currentCard();
    if (!card) {
      return [];
    }
    return card.squares.map((s) => ({
      row: s.row,
      column: s.column,
      displayText: s.displayText,
      isFreeSpace: s.isFreeSpace,
      isMarked: s.isMarked,
      markedByLabel: formatMarkedByLabel(s.markedBy),
      markedByVariant: markedByVariant(s.markedBy),
      markedAt: s.markedAt ?? null,
    }));
  });

  readonly currentRank = computed(() => {
    const entry = this.store
      .leaderboard()
      .find((entry) => entry.playerId === this.store.currentPlayerId());
    return entry?.rank ?? null;
  });

  readonly winningSquares = computed(() => {
    const currentId = this.store.currentPlayerId();
    const entry = this.store.leaderboard().find((e) => e.playerId === currentId);
    if (!entry || !entry.winningSquares) {
      return new Set<string>();
    }
    return new Set(entry.winningSquares.map((s) => `${s.row},${s.column}`));
  });

  onNewRoom(): void {
    this.toast.clear();
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.session.clearSession();
      this.router.navigate(['/']);
    }
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
