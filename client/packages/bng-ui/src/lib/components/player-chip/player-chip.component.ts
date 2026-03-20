import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import { getAvatarColor, getAvatarInitials } from '../../types';

@Component({
  selector: 'bng-player-chip',
  standalone: true,
  template: `
    <div
      class="flex items-center gap-3 px-2 py-1.5 rounded-lg"
      [class.bg-accent-muted]="isCurrentPlayer()"
      [attr.aria-label]="ariaLabel()"
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
        [style.backgroundColor]="avatarColor()"
      >
        {{ initials() }}
      </div>

      <div class="flex items-center gap-2 min-w-0 flex-1">
        <span class="text-base text-text-primary truncate leading-normal">
          {{ displayName() }}
          @if (isCurrentPlayer()) {
            <span class="text-xs text-text-secondary leading-none"> (You)</span>
          }
        </span>
      </div>

      @if (isHost()) {
        <span
          class="text-xs font-medium text-accent bg-accent-muted rounded-full px-2 py-0.5 shrink-0"
        >
          Host
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngPlayerChipComponent {
  displayName = input.required<string>();
  isHost = input(false);
  isCurrentPlayer = input(false);
  hasWon = input(false);
  rank = input<number | null>(null);

  protected avatarColor = computed(() => getAvatarColor(this.displayName()));
  protected initials = computed(() => getAvatarInitials(this.displayName()));

  protected ariaLabel = computed(() => {
    const parts = [this.displayName()];
    if (this.isHost()) {
      parts.push('host');
    }
    if (this.isCurrentPlayer()) {
      parts.push('you');
    }
    if (this.hasWon() && this.rank() !== null) {
      parts.push(`winner rank ${this.rank()}`);
    }
    return parts.join(', ');
  });
}
