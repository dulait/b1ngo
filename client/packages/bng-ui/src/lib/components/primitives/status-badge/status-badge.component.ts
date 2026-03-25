import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';
import { BadgeVariant } from '../../../types';

interface VariantStyle {
  container: string;
  dot: string;
  text: string;
}

const VARIANT_STYLES: Record<BadgeVariant, VariantStyle> = {
  warning: { container: 'bg-warning-bg', dot: 'bg-warning', text: 'text-warning' },
  success: {
    container: 'bg-success-bg',
    dot: 'bg-success pulse-dot',
    text: 'text-success',
  },
  neutral: {
    container: 'bg-completed-bg',
    dot: 'bg-completed',
    text: 'text-completed',
  },
};

@Component({
  selector: 'bng-status-badge',
  standalone: true,
  template: `
    <div role="status" data-testid="status-badge" [attr.aria-label]="label()" [class]="containerClasses()">
      <span [class]="dotClasses()"></span>
      <span class="text-xs font-semibold" [class]="textColorClass()">
        {{ label() }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngStatusBadgeComponent {
  label = input.required<string>();
  variant = input.required<BadgeVariant>();

  private readonly style = computed(() => VARIANT_STYLES[this.variant()]);

  protected containerClasses = computed(
    () => `flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0 ${this.style().container}`,
  );

  protected dotClasses = computed(() => `w-1.5 h-1.5 rounded-full ${this.style().dot}`);

  protected textColorClass = computed(() => this.style().text);
}
