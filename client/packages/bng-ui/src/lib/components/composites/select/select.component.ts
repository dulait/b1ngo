import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  signal,
  computed,
  viewChild,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const TYPE_AHEAD_TIMEOUT_MS = 500;

let nextSelectId = 0;

@Component({
  selector: 'bng-select',
  standalone: true,
  host: { style: 'display: block' },
  template: `
    <div class="relative max-w-full overflow-visible">
      <label [id]="labelId" [attr.for]="triggerId" class="block text-sm text-text-secondary mb-1.5">
        {{ label() }}
      </label>

      <!-- Trigger -->
      <button
        #triggerEl
        [id]="triggerId"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="activeDescendantId()"
        [attr.aria-describedby]="hasMessage() ? messageId : null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-labelledby]="labelId"
        [disabled]="disabled()"
        class="w-full h-12 bg-bg-surface border rounded-lg px-4 pr-10 text-left text-base relative focus:outline-none group"
        [class.border-border-default]="!error()"
        [class.focus:border-accent]="!error()"
        [class.border-error]="!!error()"
        [class.text-text-primary]="!!selectedLabel()"
        [class.text-text-disabled]="!selectedLabel()"
        [class.opacity-50]="disabled()"
        [class.cursor-not-allowed]="disabled()"
        [class.cursor-pointer]="!disabled()"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
      >
        {{ selectedLabel() || placeholder() }}
        <svg
          class="absolute right-3 top-1/2 pointer-events-none"
          [class.text-accent]="isOpen()"
          [class.group-hover:text-accent]="!disabled()"
          [style.transform]="isOpen() ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)'"
          style="transition: transform 200ms var(--bng-easing-default), color 200ms var(--bng-easing-default)"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      <!-- Backdrop -->
      @if (isOpen()) {
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div class="fixed inset-0 z-40" (click)="close()"></div>
      }

      <!-- Dropdown -->
      @if (isOpen()) {
        <div
          #listboxEl
          role="listbox"
          [id]="listboxId"
          [attr.aria-labelledby]="labelId"
          class="absolute top-full left-0 right-0 mt-1 z-50 bg-bg-surface-elevated border border-border-default rounded-lg max-h-[var(--bng-select-max-height)] overflow-y-auto py-1 shadow-lg bng-scrollbar"
          style="animation: select-open 150ms cubic-bezier(0.21, 1.02, 0.73, 1)"
        >
          @for (opt of options(); track opt.value; let i = $index) {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <div
              role="option"
              [id]="optionId(i)"
              [attr.aria-selected]="opt.value === value()"
              class="px-4 py-2.5 text-sm cursor-pointer border-l-[var(--bng-select-indicator-width)] transition-colors"
              [class.border-l-transparent]="opt.value !== value()"
              [class.border-l-accent]="opt.value === value()"
              [class.bg-accent-muted]="opt.value === value()"
              [class.text-accent]="opt.value === value()"
              [class.bg-bg-surface-hover]="highlightedIndex() === i && opt.value !== value()"
              (click)="selectOption(opt.value)"
              (pointerenter)="highlightedIndex.set(i)"
            >
              {{ opt.label }}
            </div>
          }
        </div>
      }

      <!-- Error / hint -->
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
export class BngSelectComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  label = input.required<string>();
  options = input<{ value: string; label: string }[]>([]);
  value = input('');
  placeholder = input('Select...');
  error = input<string | null>(null);
  hint = input<string | null>(null);
  disabled = input(false);

  valueChange = output<string>();

  protected readonly triggerEl = viewChild<ElementRef<HTMLElement>>('triggerEl');
  protected readonly listboxEl = viewChild<ElementRef<HTMLElement>>('listboxEl');

  protected readonly isOpen = signal(false);
  protected readonly highlightedIndex = signal(-1);

  private readonly id = ++nextSelectId;
  protected readonly triggerId = `bng-select-trigger-${this.id}`;
  protected readonly listboxId = `bng-select-listbox-${this.id}`;
  protected readonly labelId = `bng-select-label-${this.id}`;
  protected readonly messageId = `bng-select-msg-${this.id}`;

  private typeAheadBuffer = '';
  private typeAheadTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly selectedLabel = computed(() => {
    const v = this.value();
    const opts = this.options();
    const match = opts.find((o) => o.value === v);
    return match ? match.label : '';
  });

  protected readonly hasMessage = computed(() => !!this.error() || !!this.hint());

  protected readonly activeDescendantId = computed(() => {
    const idx = this.highlightedIndex();
    return idx >= 0 ? this.optionId(idx) : null;
  });

  ngOnDestroy(): void {
    if (this.typeAheadTimer) {
      clearTimeout(this.typeAheadTimer);
    }
  }

  protected optionId(index: number): string {
    return `bng-select-opt-${this.id}-${index}`;
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected open(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }
    this.isOpen.set(true);
    // Highlight current value or first option
    const opts = this.options();
    const idx = opts.findIndex((o) => o.value === this.value());
    this.highlightedIndex.set(idx >= 0 ? idx : 0);
    this.scrollToHighlighted();
  }

  protected close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.typeAheadBuffer = '';
  }

  protected selectOption(val: string): void {
    this.valueChange.emit(val);
    this.close();
    this.triggerEl()?.nativeElement.focus();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    const opts = this.options();
    if (opts.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          this.moveHighlight(1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.moveHighlight(-1);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          const idx = this.highlightedIndex();
          if (idx >= 0 && idx < opts.length) {
            this.selectOption(opts[idx].value);
          }
        }
        break;

      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
          this.triggerEl()?.nativeElement.focus();
        }
        break;

      case 'Home':
        if (this.isOpen()) {
          event.preventDefault();
          this.highlightedIndex.set(0);
          this.scrollToHighlighted();
        }
        break;

      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this.highlightedIndex.set(opts.length - 1);
          this.scrollToHighlighted();
        }
        break;

      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.onTypeAhead(event.key);
        }
        break;
    }
  }

  private moveHighlight(delta: number): void {
    const opts = this.options();
    if (opts.length === 0) {
      return;
    }
    const current = this.highlightedIndex();
    let next = current + delta;
    if (next < 0) {
      next = 0;
    }
    if (next >= opts.length) {
      next = opts.length - 1;
    }
    this.highlightedIndex.set(next);
    this.scrollToHighlighted();
  }

  private onTypeAhead(char: string): void {
    if (this.typeAheadTimer) {
      clearTimeout(this.typeAheadTimer);
    }
    this.typeAheadBuffer += char.toLowerCase();
    this.typeAheadTimer = setTimeout(() => {
      this.typeAheadBuffer = '';
      this.typeAheadTimer = null;
    }, TYPE_AHEAD_TIMEOUT_MS);

    const opts = this.options();
    const matchIndex = opts.findIndex((o) =>
      o.label.toLowerCase().startsWith(this.typeAheadBuffer),
    );
    if (matchIndex >= 0) {
      if (!this.isOpen()) {
        this.open();
      }
      this.highlightedIndex.set(matchIndex);
      this.scrollToHighlighted();
    }
  }

  private scrollToHighlighted(): void {
    if (!this.isBrowser) {
      return;
    }
    requestAnimationFrame(() => {
      const idx = this.highlightedIndex();
      const listbox = this.listboxEl()?.nativeElement;
      if (!listbox || idx < 0) {
        return;
      }
      const optionEl = listbox.querySelector(`#${this.optionId(idx)}`) as HTMLElement | null;
      optionEl?.scrollIntoView?.({ block: 'nearest' });
    });
  }
}
