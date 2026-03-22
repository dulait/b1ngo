import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
  signal,
} from '@angular/core';
import { BngStatusBadgeComponent } from '../status-badge/status-badge.component';
import { BngIconButtonComponent } from '../icon-button/icon-button.component';
import { BngMenuComponent } from '../menu/menu.component';
import { bngIconKebab } from '../../icons/icons';
import { SessionDto } from '../../types';

@Component({
  selector: 'bng-header',
  standalone: true,
  imports: [BngStatusBadgeComponent, BngIconButtonComponent, BngMenuComponent],
  template: `
    <header
      role="banner"
      data-testid="app-header"
      [attr.aria-label]="ariaLabel()"
      class="h-14 flex items-center justify-between px-4 bg-bg-surface border-b border-border-default pt-[env(safe-area-inset-top)]"
    >
      <span class="font-mono font-bold text-lg text-accent" data-testid="app-logo">B1NGO</span>

      <div class="relative">
        <bng-icon-button
          [icon]="kebabIcon"
          ariaLabel="Menu"
          [attr.aria-haspopup]="true"
          [attr.aria-expanded]="menuOpen()"
          (click)="menuOpen.set(!menuOpen())"
        />
        <bng-menu
          [open]="menuOpen()"
          [footer]="version()"
          [copyright]="copyright()"
          (closed)="menuOpen.set(false)"
        >
          <ng-content />
        </bng-menu>
      </div>
    </header>

    @if (roomStatus()) {
      <div data-testid="header-session-bar" class="flex items-center justify-between px-4 py-2 bg-bg-base border-b border-border-default">
        <span class="text-sm text-text-secondary" data-testid="header-session-info">
          {{ session()!.grandPrixShort }} / {{ session()!.sessionType }}
        </span>
        <bng-status-badge [status]="roomStatus()!" />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngHeaderComponent {
  joinCode = input<string | null>(null);
  roomStatus = input<'Lobby' | 'Active' | 'Completed' | null>(null);
  session = input<SessionDto | null>(null);
  version = input<string | null>(null);
  copyright = input<string | null>(null);

  protected readonly kebabIcon = bngIconKebab;
  protected menuOpen = signal(false);

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
