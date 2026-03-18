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

const SWIPE_DISMISS_THRESHOLD_PX = 100;
const DESKTOP_BREAKPOINT_PX = 1024;
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let nextSheetId = 0;

@Component({
  selector: 'bng-bottom-sheet',
  standalone: true,
  template: `
    @if (open()) {
      <!-- Backdrop: click to dismiss -->
      <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
      <div
        class="fixed inset-0 z-40 bg-black/50"
        (click)="close()"
        (keydown.escape)="close()"
      ></div>
      <div
        #sheetEl
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        class="fixed z-50 bg-bg-surface-elevated max-h-[85vh] overflow-y-auto touch-none"
        [class]="
          isDesktop()
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full rounded-xl'
            : 'bottom-0 left-0 right-0 rounded-t-2xl'
        "
        [style.animation]="dragging() ? 'none' : 'sheet-open 300ms cubic-bezier(0.32, 0.72, 0, 1)'"
        [style.transform]="sheetTransform()"
        (keydown.escape)="close()"
        (keydown)="onSheetKeydown($event)"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp()"
        (pointercancel)="onPointerUp()"
      >
        @if (!isDesktop()) {
          <div
            class="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
            (click)="close()"
            (keydown.enter)="close()"
            role="button"
            tabindex="0"
            aria-label="Close sheet"
          >
            <div class="w-10 h-1 bg-border-default rounded-full"></div>
          </div>
        }
        <div [id]="titleId" class="text-[1.125rem] font-semibold leading-[1.33] px-4 pt-4 pb-3">
          {{ title() }}
        </div>
        <div
          class="px-4 pb-4"
          style="padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px))"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngBottomSheetComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  title = input.required<string>();
  open = input(false);
  closed = output<void>();

  protected readonly sheetEl = viewChild<ElementRef<HTMLElement>>('sheetEl');
  protected readonly isDesktop = signal(false);
  protected readonly dragging = signal(false);
  protected readonly dragOffset = signal(0);
  protected readonly titleId = `bng-sheet-title-${++nextSheetId}`;

  private dragStartY = 0;
  private previouslyFocusedElement: HTMLElement | null = null;

  protected sheetTransform = computed(() => {
    const offset = this.dragOffset();
    if (this.isDesktop() || offset <= 0) {
      return '';
    }
    return `translateY(${offset}px)`;
  });

  constructor() {
    effect(() => {
      if (this.open() && this.isBrowser) {
        // Capture the element that had focus before the sheet opened
        this.previouslyFocusedElement = document.activeElement as HTMLElement | null;
        this.checkDesktop();
        this.dragOffset.set(0);
        this.dragging.set(false);
        requestAnimationFrame(() => {
          const el = this.sheetEl()?.nativeElement;
          if (el) {
            const focusable = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
            (focusable ?? el).focus();
          }
        });
      }
      if (!this.open() && this.isBrowser) {
        // Restore focus to the trigger element on close
        this.previouslyFocusedElement?.focus();
        this.previouslyFocusedElement = null;
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  /** Focus trap: cycle Tab within the sheet */
  protected onSheetKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const el = this.sheetEl()?.nativeElement;
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

  protected onPointerDown(event: PointerEvent): void {
    if (this.isDesktop()) {
      return;
    }
    this.dragStartY = event.clientY;
    this.dragging.set(true);
    // Capture pointer for reliable tracking even if finger leaves element
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.isDesktop() || !this.dragging()) {
      return;
    }
    const delta = event.clientY - this.dragStartY;
    // Only allow dragging downward (positive delta)
    this.dragOffset.set(Math.max(0, delta));
  }

  protected onPointerUp(): void {
    if (!this.dragging()) {
      return;
    }
    if (this.dragOffset() > SWIPE_DISMISS_THRESHOLD_PX) {
      this.close();
    }
    this.dragOffset.set(0);
    this.dragging.set(false);
    this.dragStartY = 0;
  }

  private checkDesktop(): void {
    this.isDesktop.set(this.isBrowser && window.innerWidth > DESKTOP_BREAKPOINT_PX);
  }
}
