import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
} from '@angular/core';
import { BngIconComponent } from '../../icons/icon.component';
import { bngIconSpinner } from '../../icons/icons';

@Component({
  selector: 'bng-button',
  standalone: true,
  imports: [BngIconComponent],
  template: `
    <button
      [type]="type()"
      [class]="buttonClasses()"
      [attr.aria-disabled]="disabled() || loading() || undefined"
      [attr.aria-busy]="loading() || undefined"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <bng-icon [icon]="spinnerIcon" size="md" class="animate-spin" />
      } @else {
        <ng-content />
      }
    </button>
  `,
  host: {
    '[style.display]': 'fullWidth() ? "block" : "inline-block"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'default' | 'sm' | 'lg'>('default');
  disabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit'>('button');
  fullWidth = input(false);

  clicked = output<void>();

  protected readonly spinnerIcon = bngIconSpinner;

  protected buttonClasses = computed(() => {
    const variant = this.variant();
    const size = this.size();
    const isDisabled = this.disabled() || this.loading();

    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base focus:ring-accent';

    const sizeClasses: Record<string, string> = {
      sm: 'h-[36px] text-sm font-medium px-3 py-2 rounded-lg',
      default: 'h-[44px] text-base px-4 py-3 rounded-lg',
      lg: 'h-[52px] text-base px-6 py-3.5 rounded-lg',
    };

    const variantClasses: Record<string, string> = {
      primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.97]',
      secondary:
        'bg-transparent border border-border-default text-text-primary hover:bg-bg-surface-hover active:scale-[0.97]',
      ghost: 'bg-transparent text-accent hover:bg-accent-muted active:scale-[0.97]',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:scale-[0.97]',
    };

    const width = this.fullWidth() ? 'w-full' : '';
    const disabledClass = isDisabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer';

    return `${base} ${sizeClasses[size]} ${variantClasses[variant]} ${width} ${disabledClass}`.trim();
  });

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit();
  }
}
