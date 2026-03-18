import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import { BngStatusBadgeComponent } from '../status-badge/status-badge.component';
import { SessionDto } from '../../types';

@Component({
  selector: 'bng-header',
  standalone: true,
  imports: [BngStatusBadgeComponent],
  template: `
    <header
      role="banner"
      [attr.aria-label]="ariaLabel()"
      class="h-14 flex items-center justify-between px-4 bg-bg-surface border-b border-border-default pt-[env(safe-area-inset-top)]"
    >
      <span class="font-mono font-bold text-lg text-accent">B1NGO</span>

      @if (session()) {
        <span class="text-sm text-text-secondary truncate mx-3">
          {{ session()!.grandPrixShort }} / {{ session()!.sessionType }}
        </span>
      }

      @if (roomStatus()) {
        <bng-status-badge [status]="roomStatus()!" />
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngHeaderComponent {
  joinCode = input<string | null>(null);
  roomStatus = input<'Lobby' | 'Active' | 'Completed' | null>(null);
  session = input<SessionDto | null>(null);

  protected ariaLabel = computed(() => {
    const parts: string[] = [];
    if (this.joinCode()) {
      parts.push(`Room ${this.joinCode()}`);
    }
    if (this.roomStatus()) {
      parts.push(this.roomStatus()!);
    }
    const s = this.session();
    if (s) {
      parts.push(`${s.grandPrixShort} / ${s.sessionType}`);
    }
    return parts.join(', ');
  });
}
