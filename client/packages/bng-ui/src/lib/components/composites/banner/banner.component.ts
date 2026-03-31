import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { BngIconButtonComponent } from '../../primitives/icon-button/icon-button.component';
import { bngIconX } from '../../../icons/icons';
import { BannerVariant } from '../../../types/types';

@Component({
  selector: 'bng-banner',
  standalone: true,
  imports: [BngIconButtonComponent],
  host: { style: 'display: block' },
  template: `
    <div
      role="status"
      class="flex items-center gap-3 rounded-xl border px-4 py-3"
      [class.border-accent]="variant() === 'accent'"
      [class.bg-accent-muted]="variant() === 'accent'"
      [class.border-error]="variant() === 'error'"
      [class.bg-error-muted]="variant() === 'error'"
    >
      <div class="flex-1 min-w-0">
        <ng-content />
      </div>
      <ng-content select="[bannerAction]" />
      @if (dismissible()) {
        <bng-icon-button
          [icon]="xIcon"
          ariaLabel="Dismiss"
          size="sm"
          (click)="dismissed.emit()"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngBannerComponent {
  variant = input<BannerVariant>('accent');
  dismissible = input(true);
  dismissed = output<void>();

  protected readonly xIcon = bngIconX;
}
