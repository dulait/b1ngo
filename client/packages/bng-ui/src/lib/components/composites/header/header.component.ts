import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';
import { BngIconButtonComponent } from '../../primitives/icon-button/icon-button.component';
import { BngMenuComponent } from '../menu/menu.component';
import { bngIconKebab } from '../../../icons/icons';

@Component({
  selector: 'bng-header',
  standalone: true,
  imports: [BngIconButtonComponent, BngMenuComponent],
  template: `
    <header
      role="banner"
      data-testid="app-header"
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

    <ng-content select="[headerSubbar]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngHeaderComponent {
  version = input<string | null>(null);
  copyright = input<string | null>(null);

  protected readonly kebabIcon = bngIconKebab;
  protected menuOpen = signal(false);
}
