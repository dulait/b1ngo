import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { BngIconComponent } from '../../icons/icon.component';
import { bngIconCheckFilled } from '../../icons/icons';

export interface PillToggleOption {
  value: string;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'bng-pill-toggle',
  standalone: true,
  imports: [BngIconComponent],
  host: { style: 'display: block' },
  template: `
    <div role="group" [attr.aria-label]="ariaLabel()" class="flex flex-wrap gap-2">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors cursor-pointer"
          [class.border-accent]="option.selected"
          [class.bg-accent-muted]="option.selected"
          [class.text-accent]="option.selected"
          [class.border-border-default]="!option.selected"
          [class.text-text-secondary]="!option.selected"
          [attr.aria-pressed]="option.selected"
          (click)="onToggle(option.value)"
        >
          @if (option.selected) {
            <bng-icon
              [icon]="checkFilledIcon"
              size="sm"
              viewBox="0 0 14 14"
              strokeWidth="0"
              class="shrink-0"
            />
          } @else {
            <span class="w-3.5 h-3.5 rounded border border-border-default shrink-0"></span>
          }
          {{ option.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngPillToggleComponent {
  options = input<PillToggleOption[]>([]);
  ariaLabel = input('Options');
  toggled = output<string>();

  protected readonly checkFilledIcon = bngIconCheckFilled;

  protected onToggle(value: string): void {
    this.toggled.emit(value);
  }
}
