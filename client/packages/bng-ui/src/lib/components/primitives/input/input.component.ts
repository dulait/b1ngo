import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { BngIconButtonComponent } from '../icon-button/icon-button.component';
import { bngIconEye, bngIconEyeOff } from '../../../icons/icons';

let nextInputId = 0;

@Component({
  selector: 'bng-input',
  standalone: true,
  imports: [BngIconButtonComponent],
  host: { style: 'display: block' },
  template: `
    <div class="max-w-full overflow-hidden">
      <label [for]="inputId" class="block text-sm text-text-secondary mb-1.5">
        {{ label() }}
      </label>

      <div [class.relative]="isPassword()">
        <input
          #inputEl
          [id]="inputId"
          [type]="effectiveType()"
          [value]="value()"
          [placeholder]="placeholder()"
          [attr.maxlength]="maxlength()"
          [attr.autocomplete]="autocomplete()"
          [attr.aria-describedby]="hasMessage() ? messageId : null"
          [attr.aria-invalid]="error() ? true : null"
          class="w-full h-12 bg-bg-surface border rounded-lg px-4 text-text-primary text-base placeholder:text-text-disabled focus:outline-none"
          [class.border-border-default]="!error()"
          [class.focus:border-accent]="!error()"
          [class.border-error]="!!error()"
          [class.pr-12]="isPassword()"
          (input)="onValueChange($event)"
        />

        @if (isPassword()) {
          <div
            class="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
            (mousedown)="$event.preventDefault()"
          >
            <bng-icon-button
              [icon]="passwordVisible() ? eyeOffIcon : eyeIcon"
              [ariaLabel]="passwordVisible() ? 'Hide password' : 'Show password'"
              [tabIndex]="-1"
              size="sm"
              (click)="togglePassword(inputEl)"
            />
          </div>
        }
      </div>

      @if (error()) {
        <p [id]="messageId" class="mt-1 text-xs text-error">{{ error() }}</p>
      } @else if (hint()) {
        <p [id]="messageId" class="mt-1 text-xs text-text-secondary">{{ hint() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngInputComponent {
  label = input.required<string>();
  type = input<'text' | 'email' | 'password'>('text');
  placeholder = input('');
  error = input<string | null>(null);
  hint = input<string | null>(null);
  maxlength = input<number | null>(null);
  value = input('');
  autocomplete = input('off');

  valueChange = output<string>();

  protected readonly inputId = `bng-input-${++nextInputId}`;
  protected readonly messageId = `${this.inputId}-msg`;

  protected readonly eyeIcon = bngIconEye;
  protected readonly eyeOffIcon = bngIconEyeOff;
  protected readonly passwordVisible = signal(false);
  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly effectiveType = computed(() =>
    this.isPassword() && this.passwordVisible() ? 'text' : this.type(),
  );

  protected hasMessage = computed(() => !!this.error() || !!this.hint());

  protected onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  protected togglePassword(inputEl: HTMLInputElement): void {
    this.passwordVisible.update((v) => !v);
    inputEl.focus();
  }
}
