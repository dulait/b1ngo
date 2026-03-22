import { Component, ChangeDetectionStrategy, ViewEncapsulation, input, output } from '@angular/core';

@Component({
  selector: 'bng-menu',
  standalone: true,
  host: { style: 'display: contents' },
  template: `
    @if (open()) {
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <div class="fixed inset-0 z-40" (click)="closed.emit()"></div>
      <div
        role="menu"
        class="absolute top-[calc(100%+6px)] right-0 min-w-[200px] z-50 bg-bg-surface-elevated border border-border-default rounded-[10px] p-1 shadow-lg"
        style="animation: menu-open 150ms ease; transform-origin: top right"
        (keydown.escape)="closed.emit()"
      >
        <ng-content />
        @if (footer()) {
          <div class="mt-1 pt-1.5 pb-1 px-3 border-t border-border-default text-[0.7rem] text-text-secondary text-right opacity-60">
            {{ footer() }}
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngMenuComponent {
  open = input(false);
  footer = input<string | null>(null);
  closed = output<void>();
}
