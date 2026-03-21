import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { BngIconComponent } from '../../icons/icon.component';
import { bngIconCopy, bngIconShare } from '../../icons/icons';

const FILTERED_CHARS = new Set(['0', 'O', 'I', '1']);
const COPY_FEEDBACK_DURATION_MS = 2000;

@Component({
  selector: 'bng-code-input',
  standalone: true,
  imports: [BngIconComponent],
  template: `
    @if (mode() === 'input') {
      <div>
        <div class="flex gap-2 justify-center relative">
          @for (i of boxIndices(); track i) {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <div
              class="w-12 h-14 bg-bg-surface border rounded-lg flex items-center justify-center font-mono font-bold text-[1.75rem] text-text-primary cursor-text"
              [class.border-accent]="i === currentValue().length && !error()"
              [class.border-border-default]="i !== currentValue().length && !error()"
              [class.border-error]="!!error()"
              (click)="focusInput()"
            >
              {{ currentValue()[i] || '' }}
            </div>
          }
          <input
            #hiddenInput
            type="text"
            class="absolute inset-0 opacity-0 w-full h-full"
            [attr.maxlength]="length()"
            [attr.aria-label]="'Join code'"
            [attr.aria-invalid]="error() ? true : null"
            autocomplete="off"
            (input)="onInput($event)"
            (paste)="onPaste($event)"
            (focus)="onFocus()"
          />
        </div>
        @if (error()) {
          <p class="mt-2 text-xs text-error text-center">{{ error() }}</p>
        }
      </div>
    } @else {
      <div>
        <div class="flex gap-2 justify-center mb-3">
          @for (char of displayChars(); track $index) {
            <span
              class="bg-bg-surface-elevated px-2.5 py-2 rounded-md font-mono font-bold text-2xl tracking-[0.15em] text-text-primary"
            >
              {{ char }}
            </span>
          }
        </div>
        <div class="flex gap-3 justify-center">
          <button
            class="flex items-center gap-1.5 text-accent text-sm font-medium px-3 py-2 rounded-lg hover:bg-accent-muted transition-colors"
            [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
            (click)="copyCode()"
          >
            <bng-icon [icon]="copyIcon" size="sm" />
            {{ copied() ? 'Copied!' : 'Copy' }}
          </button>
          @if (canShare) {
            <button
              class="flex items-center gap-1.5 text-accent text-sm font-medium px-3 py-2 rounded-lg hover:bg-accent-muted transition-colors"
              aria-label="Share code"
              (click)="shareCode()"
            >
              <bng-icon [icon]="shareIcon" size="sm" />
              Share
            </button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngCodeInputComponent {
  length = input(6);
  mode = input<'input' | 'display'>('input');
  value = input('');
  error = input<string | null>(null);

  codeComplete = output<string>();
  codeChange = output<string>();

  protected readonly hiddenInput = viewChild<ElementRef<HTMLInputElement>>('hiddenInput');
  protected readonly currentValue = signal('');
  protected readonly copied = signal(false);

  protected readonly copyIcon = bngIconCopy;
  protected readonly shareIcon = bngIconShare;
  protected readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;

  protected boxIndices = computed(() => Array.from({ length: this.length() }, (_, i) => i));
  protected displayChars = computed(() => this.value().split(''));

  protected focusInput(): void {
    this.hiddenInput()?.nativeElement.focus();
  }

  protected onFocus(): void {
    this.hiddenInput()?.nativeElement.closest('.flex')?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const filtered = this.sanitizeCode(target.value);
    target.value = filtered;
    this.applyValue(filtered);
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const filtered = this.sanitizeCode(pasted);

    const inputEl = this.hiddenInput()?.nativeElement;
    if (inputEl) {
      inputEl.value = filtered;
    }
    this.applyValue(filtered);
  }

  protected async copyCode(): Promise<void> {
    if (!navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(this.value());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), COPY_FEEDBACK_DURATION_MS);
  }

  protected async shareCode(): Promise<void> {
    if (!navigator.share) {
      return;
    }
    await navigator
      .share({
        title: 'B1NGO Room Code',
        text: `Join my B1NGO room: ${this.value()}`,
      })
      .catch(() => {
        /* User cancelled share dialog */
      });
  }

  private sanitizeCode(raw: string): string {
    return raw
      .toUpperCase()
      .split('')
      .filter((ch) => /[A-Z2-9]/.test(ch) && !FILTERED_CHARS.has(ch))
      .join('')
      .slice(0, this.length());
  }

  private applyValue(code: string): void {
    this.currentValue.set(code);
    this.codeChange.emit(code);
    if (code.length === this.length()) {
      this.codeComplete.emit(code);
    }
  }
}
