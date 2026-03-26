import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
} from '@angular/core';

let nextInputId = 0;

@Component({
  selector: 'bng-input',
  standalone: true,
  host: { style: 'display: block' },
  template: `
    <div class="max-w-full overflow-hidden">
      <label [for]="inputId" class="block text-sm text-text-secondary mb-1.5">
        {{ label() }}
      </label>

      <input
        [id]="inputId"
        [type]="type()"
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
        (input)="onValueChange($event)"
      />

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

  protected hasMessage = computed(() => !!this.error() || !!this.hint());

  protected onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
