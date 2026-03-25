import { Component, ChangeDetectionStrategy, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'bng-card',
  standalone: true,
  host: { style: 'display: block' },
  template: `
    <div
      class="bg-bg-surface border border-border-default rounded-xl p-4"
      [attr.role]="header() ? 'region' : null"
      [attr.aria-label]="header() ?? undefined"
    >
      @if (header()) {
        <div
          class="text-[1.125rem] font-semibold leading-[1.33] pb-3 border-b border-border-subtle mb-3"
        >
          {{ header() }}
        </div>
      }
      <ng-content />
      <ng-content select="[card-actions]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngCardComponent {
  header = input<string | null>(null);
}
