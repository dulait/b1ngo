import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'bng-tab-bar',
  standalone: true,
  template: `
    <nav
      role="navigation"
      aria-label="Main navigation"
      class="fixed bottom-0 inset-x-0 h-14 flex items-center justify-around bg-bg-surface border-t border-border-default pb-[env(safe-area-inset-bottom)] z-40"
    >
      <ng-content />
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngTabBarComponent {}
