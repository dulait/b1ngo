import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import {
  LeaderboardItem,
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
          [attr.data-testid]="'leaderboard-entry-' + entry.rank"
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
          <div [class]="avatarClasses()" [style.backgroundColor]="getColor(entry)">
            {{ getInitials(entry) }}
          </div>

          <!-- Name -->
          <span class="text-sm text-text-primary font-medium flex-1 truncate">
            {{ entry.displayName }}
            @if (entry.isCurrentUser) {
              <span class="text-text-secondary font-normal"> (You)</span>
            }
          </span>

          <!-- Badge -->
          <span
            class="text-xs bg-bg-surface-elevated text-text-secondary rounded-full px-2 py-0.5 shrink-0"
          >
            {{ entry.badge }}
          </span>

          <!-- Timestamp -->
          <span
            class="text-xs text-text-secondary tabular-nums shrink-0"
            [class.ml-auto]="variant() === 'compact'"
          >
            {{ formatTime(entry.timestamp) }}
          </span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngLeaderboardComponent {
  entries = input<LeaderboardItem[]>([]);
  variant = input<'compact' | 'full'>('compact');
  emptyText = input('No winners yet.');

  protected avatarClasses = computed(() =>
    this.variant() === 'compact' ? AVATAR_COMPACT : AVATAR_FULL,
  );

  protected getColor(entry: LeaderboardItem): string {
    return getAvatarColor(entry.displayName);
  }

  protected getInitials(entry: LeaderboardItem): string {
    return getAvatarInitials(entry.displayName);
  }

  protected entryClasses(entry: LeaderboardItem): string {
    const base = 'flex items-center gap-3';
    if (this.variant() === 'compact') {
      return `${base} px-2 py-1.5`;
    }
    const highlight = entry.isCurrentUser ? 'bg-accent-muted' : '';
    return `${base} px-3 py-2.5 rounded-lg ${highlight}`;
  }

  protected entryAriaLabel(entry: LeaderboardItem): string {
    return `${entry.rank}. ${entry.displayName}, ${entry.badge}, ${this.formatTime(entry.timestamp)}`;
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
