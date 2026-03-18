import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngButtonComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-buttons',
  standalone: true,
  imports: [BngButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Buttons</h2>
    <p class="text-sm text-text-secondary mb-6">
      Four variants across three sizes, plus disabled, loading, and full-width states.
    </p>

    <div class="space-y-6">
      <!-- Variants x Sizes -->
      <bng-card header="Variants &amp; Sizes">
        <div class="space-y-4">
          @for (variant of variants; track variant) {
            <div>
              <p class="text-xs text-text-secondary mb-2 capitalize">{{ variant }}</p>
              <div class="flex flex-wrap items-center gap-3">
                @for (size of sizes; track size) {
                  <bng-button [variant]="variant" [size]="size">
                    {{ size === 'sm' ? 'Small' : size === 'lg' ? 'Large' : 'Default' }}
                  </bng-button>
                }
              </div>
            </div>
          }
        </div>
      </bng-card>

      <!-- Disabled -->
      <bng-card header="Disabled">
        <div class="flex flex-wrap items-center gap-3">
          @for (variant of variants; track variant) {
            <bng-button [variant]="variant" [disabled]="true">{{ variant }}</bng-button>
          }
        </div>
      </bng-card>

      <!-- Loading -->
      <bng-card header="Loading">
        <div class="flex flex-wrap items-center gap-3">
          @for (variant of variants; track variant) {
            <bng-button [variant]="variant" [loading]="true">{{ variant }}</bng-button>
          }
        </div>
      </bng-card>

      <!-- Full Width -->
      <bng-card header="Full Width">
        <bng-button variant="primary" [fullWidth]="true">Full-width Primary</bng-button>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsSection {
  readonly variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
  readonly sizes = ['sm', 'default', 'lg'] as const;
}
