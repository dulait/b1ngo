import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  effect,
  ElementRef,
  viewChild,
  signal,
  computed,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let nextModalId = 0;

@Component({
  selector: 'bng-modal',
  standalone: true,
  template: `
    @if (open()) {
      <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
      <div
        class="fixed inset-0 z-50 bg-black/50"
        [class.backdrop-blur-sm]="blurBackdrop()"
        [style.animation]="backdropAnimation()"
        (click)="close()"
        (keydown.escape)="close()"
      ></div>

      <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          #dialogEl
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="labelId"
          class="bg-bg-surface-elevated rounded-xl shadow-lg max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto"
          [class]="dialogClasses()"
          [style.animation]="dialogAnimation()"
          (keydown.escape)="close()"
          (keydown)="onDialogKeydown($event)"
        >
          <ng-content select="[modal-header]" />
          <div class="flex-1 overflow-y-auto bng-scrollbar min-h-0">
            <ng-content />
          </div>
          <ng-content select="[modal-footer]" />
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngModalComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  open = input(false);
  maxWidth = input<'sm' | 'md' | 'lg'>('md');
  blurBackdrop = input(false);

  closed = output<void>();

  protected readonly dialogEl = viewChild<ElementRef<HTMLElement>>('dialogEl');
  protected readonly labelId = `bng-modal-label-${++nextModalId}`;
  protected readonly animating = signal(true);
  protected readonly closing = signal(false);

  private previouslyFocusedElement: HTMLElement | null = null;

  protected readonly maxWidthClasses: Record<string, string> = {
    sm: 'max-w-[384px]',
    md: 'max-w-[448px]',
    lg: 'max-w-[512px]',
  };

  protected dialogClasses = computed(() => {
    const mw = this.maxWidth();
    return `mx-4 w-full ${this.maxWidthClasses[mw]}`;
  });

  protected backdropAnimation = computed(() => {
    if (this.closing()) {
      return 'modal-backdrop-close 150ms ease-in forwards';
    }
    if (this.animating()) {
      return 'modal-backdrop-open 250ms ease-out';
    }
    return 'none';
  });

  protected dialogAnimation = computed(() => {
    if (this.closing()) {
      return 'modal-dialog-close 150ms ease-in forwards';
    }
    if (this.animating()) {
      return 'modal-dialog-open 250ms ease-out';
    }
    return 'none';
  });

  constructor() {
    effect(() => {
      if (this.open() && this.isBrowser) {
        this.previouslyFocusedElement = document.activeElement as HTMLElement | null;
        this.closing.set(false);
        this.animating.set(true);
        document.body.style.overflow = 'hidden';

        setTimeout(() => this.animating.set(false), 250);

        requestAnimationFrame(() => {
          const el = this.dialogEl()?.nativeElement;
          if (el) {
            const focusable = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
            (focusable ?? el).focus();
          }
        });
      }

      if (!this.open() && this.isBrowser) {
        document.body.style.overflow = '';
        this.previouslyFocusedElement?.focus();
        this.previouslyFocusedElement = null;
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onDialogKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const el = this.dialogEl()?.nativeElement;
    if (!el) {
      return;
    }

    const focusableElements = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}
