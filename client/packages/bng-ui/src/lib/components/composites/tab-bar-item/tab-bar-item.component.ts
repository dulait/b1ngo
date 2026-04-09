import { Component, ChangeDetectionStrategy, ViewEncapsulation, input, output } from '@angular/core';
import { BngIconComponent } from '../../primitives/icon/icon.component';

@Component({
  selector: 'bng-tab-bar-item',
  standalone: true,
  imports: [BngIconComponent],
  host: { class: 'flex-1 h-full' },
  template: `
    <button
      type="button"
      class="flex flex-col items-center justify-center w-full h-full bg-transparent border-none cursor-pointer transition-colors duration-150 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset [-webkit-tap-highlight-color:transparent]"
      [class.text-accent]="active()"
      [class.text-text-muted]="!active()"
      [attr.aria-label]="label()"
      [attr.aria-current]="active() ? 'page' : null"
      (click)="onClick()"
    >
      <div class="relative">
        <bng-icon [icon]="icon()" size="lg" />
        <ng-content select="[tabBadge]" />
      </div>
      <span class="text-[0.625rem] font-medium">{{ label() }}</span>
    </button>
  `,
  styles: `
    bng-tab-bar-item [tabBadge] {
      position: absolute;
      top: -2px;
      right: -6px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngTabBarItemComponent {
  icon = input.required<string>();
  label = input.required<string>();
  active = input<boolean>(false);
  clicked = output<void>();

  protected onClick(): void {
    if (!this.active()) {
      this.clicked.emit();
    }
  }
}
