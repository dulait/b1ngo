import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import {
  PlayerDto,
  LeaderboardEntryDto,
  getAvatarColor,
  getAvatarInitials,
  formatRelativeTime,
} from '../../types';

const AVATAR_BASE = 'rounded-full flex items-center justify-center text-white font-medium shrink-0';
const AVATAR_COMPACT = `w-7 h-7 text-[10px] ${AVATAR_BASE}`;
const AVATAR_FULL = `w-8 h-8 text-xs ${AVATAR_BASE}`;

@Component({
  selector: 'bng-leaderboard',
  standalone: true,
  template: `
    <div role="list" aria-label="Leaderboard" class="space-y-1">
      @if (entries().length === 0) {
        <p class="text-sm text-text-secondary text-center py-4">{{ emptyText() }}</p>
      }
      @for (entry of entries(); track entry.rank) {
        <div
          role="listitem"
          [attr.aria-label]="entryAriaLabel(entry)"
          [class]="entryClasses(entry)"
        >
          <!-- Rank -->
          <span
            class="w-7 text-center font-bold text-sm"
            [class.text-green-500]="entry.rank === 1"
            [class.text-text-secondary]="entry.rank !== 1"
          >
            #{{ entry.rank }}
          </span>

          <!-- Avatar -->
          <div [class]="avatarClasses()" [style.backgroundColor]="getColor(entry.playerId)">
            {{ getInitials(entry.playerId) }}
          </div>

          <!-- Name -->
          <span class="text-sm text-text-primary font-medium flex-1 truncate">
            {{ getName(entry.playerId) }}
            @if (entry.playerId === currentPlayerId()) {
              <span class="text-text-secondary font-normal"> (You)</span>
            }
          </span>

          <!-- Pattern badge -->
          <span
            class="text-xs bg-bg-surface-elevated text-text-secondary rounded-full px-2 py-0.5 shrink-0"
          >
            {{ entry.pattern }}
          </span>

          <!-- Timestamp -->
          <span
            class="text-xs text-text-secondary tabular-nums shrink-0"
            [class.ml-auto]="variant() === 'compact'"
          >
            {{ formatTime(entry.completedAt) }}
          </span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngLeaderboardComponent {
  entries = input<LeaderboardEntryDto[]>([]);
  players = input<PlayerDto[]>([]);
  currentPlayerId = input('');
  variant = input<'compact' | 'full'>('compact');
  emptyText = input('No winners yet.');

  protected avatarClasses = computed(() =>
    this.variant() === 'compact' ? AVATAR_COMPACT : AVATAR_FULL,
  );

  private playerMap = computed(() => {
    const map = new Map<string, PlayerDto>();
    for (const p of this.players()) {
      map.set(p.playerId, p);
    }
    return map;
  });

  protected getName(playerId: string): string {
    return this.playerMap().get(playerId)?.displayName ?? 'Unknown';
  }

  protected getColor(playerId: string): string {
    const name = this.getName(playerId);
    return getAvatarColor(name);
  }

  protected getInitials(playerId: string): string {
    const name = this.getName(playerId);
    return getAvatarInitials(name);
  }

  protected entryClasses(entry: LeaderboardEntryDto): string {
    const base = 'flex items-center gap-3';
    if (this.variant() === 'compact') {
      return `${base} px-2 py-1.5`;
    }
    const highlight = entry.playerId === this.currentPlayerId() ? 'bg-accent-muted' : '';
    return `${base} px-3 py-2.5 rounded-lg ${highlight}`;
  }

  protected entryAriaLabel(entry: LeaderboardEntryDto): string {
    return `${entry.rank}. ${this.getName(entry.playerId)}, ${entry.pattern}, ${this.formatTime(entry.completedAt)}`;
  }

  protected formatTime(iso: string): string {
    if (this.variant() === 'compact') {
      return formatRelativeTime(iso);
    }
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
