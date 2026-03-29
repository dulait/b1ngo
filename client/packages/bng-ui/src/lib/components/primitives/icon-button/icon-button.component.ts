import { Component, ChangeDetectionStrategy, ViewEncapsulation, input } from '@angular/core';
import { BngIconComponent } from '../icon/icon.component';

@Component({
  selector: 'bng-icon-button',
  standalone: true,
  imports: [BngIconComponent],
  host: { style: 'display: inline-block' },
  template: `
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-lg border-none bg-transparent text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base"
      [class.w-9]="size() === 'default'"
      [class.h-9]="size() === 'default'"
      [class.w-8]="size() === 'sm'"
      [class.h-8]="size() === 'sm'"
      [attr.aria-label]="ariaLabel()"
      [attr.tabindex]="tabIndex()"
    >
      <bng-icon [icon]="icon()" size="lg" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngIconButtonComponent {
  icon = input.required<string>();
  ariaLabel = input.required<string>();
  size = input<'sm' | 'default'>('default');
  tabIndex = input<number | null>(null);
}
