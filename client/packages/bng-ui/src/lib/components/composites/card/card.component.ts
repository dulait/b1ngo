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
          class="text-[length:var(--bng-text-xl)] font-semibold leading-[var(--bng-leading-snug)] pb-3 border-b border-border-subtle mb-3"
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
