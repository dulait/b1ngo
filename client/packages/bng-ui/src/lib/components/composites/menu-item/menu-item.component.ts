import { Component, ChangeDetectionStrategy, ViewEncapsulation, input, output } from '@angular/core';
import { BngIconComponent } from '../../primitives/icon/icon.component';

@Component({
  selector: 'bng-menu-item',
  standalone: true,
  imports: [BngIconComponent],
  host: { style: 'display: block' },
  template: `
    <button
      type="button"
      role="menuitem"
      class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent text-text-primary font-inherit text-sm rounded-md cursor-pointer transition-colors duration-150 text-left hover:bg-bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
      (click)="clicked.emit()"
    >
      @if (icon()) {
        <bng-icon [icon]="icon()!" size="lg" class="text-text-secondary" />
      } @else {
        <ng-content select="[menuItemIcon]" />
      }
      <span>{{ label() }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngMenuItemComponent {
  icon = input<string | null>(null);
  label = input.required<string>();
  clicked = output<void>();
}
