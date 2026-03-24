import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  signal,
  effect,
  ElementRef,
  viewChild,
  PLATFORM_ID,
  inject,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { formatRelativeTime } from '../../types';

const AUTO_CLOSE_DELAY_MS = 5000;
const DISMISS_LISTENER_DELAY_MS = 50;
const POPOVER_VIEWPORT_MARGIN_PX = 8;
const ARROW_HEIGHT_PX = 7;
const ARROW_HALF_WIDTH_PX = 6;
const ARROW_MIN_INSET_PX = 8;
const ARROW_MAX_INSET_PX = 20;
const MIN_SPACE_ABOVE_PX = 80;

@Component({
  selector: 'bng-square-popover',
  standalone: true,
  host: { style: 'display: contents' },
  template: `
    <div
      #popoverEl
      role="tooltip"
      class="fixed z-50 max-w-[200px] bg-bg-surface-elevated border border-border-default rounded-lg px-3 py-2.5 shadow-lg text-center"
      [style.left.px]="posX()"
      [style.top.px]="posY()"
      [style.animation]="'popover-open 150ms cubic-bezier(0.21, 1.02, 0.73, 1)'"
      (keydown.escape)="close()"
    >
      <!-- Arrow -->
      <div
        class="absolute w-0 h-0"
        [class]="arrowAbove() ? 'bottom-[-7px]' : 'top-[-7px]'"
        [style.left.px]="arrowX()"
      >
        @if (arrowAbove()) {
          <!-- Arrow pointing down (popover is above) -->
          <div
            class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border-default absolute top-0"
          ></div>
          <div
            class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-bg-surface-elevated absolute top-0 left-[1px]"
          ></div>
        } @else {
          <!-- Arrow pointing up (popover is below) -->
          <div
            class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-border-default absolute top-0"
          ></div>
          <div
            class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-bg-surface-elevated absolute top-[1px] left-[1px]"
          ></div>
        }
      </div>

      <!-- Content -->
      @if (isFreeSpace()) {
        <p class="text-sm text-text-disabled">Free Space</p>
      } @else {
        <p class="text-sm text-text-primary">{{ displayText() }}</p>
        @if (isMarked() && markedByLabel()) {
          <div class="border-t border-border-subtle mt-2 pt-2 flex justify-center gap-2">
            <span class="text-xs text-text-secondary">Marked by {{ markedByLabel() }}</span>
            @if (markedAt()) {
              <span class="text-xs text-text-secondary">{{ relativeTime() }}</span>
            }
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngSquarePopoverComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  displayText = input('');
  isFreeSpace = input(false);
  isMarked = input(false);
  markedByLabel = input<string | null>(null);
  markedAt = input<string | null>(null);
  anchorElement = input.required<HTMLElement>();

  closed = output<void>();

  protected readonly popoverEl = viewChild<ElementRef<HTMLElement>>('popoverEl');
  protected readonly posX = signal(0);
  protected readonly posY = signal(0);
  protected readonly arrowX = signal(0);
  protected readonly arrowAbove = signal(true);

  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private readonly outsideClickHandler = (e: MouseEvent): void => this.onOutsideClick(e);
  private readonly scrollHandler = (): void => this.close();
  private readonly escHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.close();
    }
  };

  protected relativeTime = (): string => {
    const at = this.markedAt();
    if (!at) {
      return '';
    }
    return formatRelativeTime(at);
  };

  constructor() {
    effect(() => {
      const anchor = this.anchorElement();
      if (anchor && this.isBrowser) {
        requestAnimationFrame(() => this.position(anchor));
        this.setupDismissListeners();
        this.autoCloseTimer = setTimeout(() => this.close(), AUTO_CLOSE_DELAY_MS);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.teardownDismissListeners();
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  close(): void {
    this.teardownDismissListeners();
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    if (!this.destroyed) {
      this.closed.emit();
    }
  }

  private position(anchor: HTMLElement): void {
    const anchorRect = anchor.getBoundingClientRect();
    const popover = this.popoverEl()?.nativeElement;
    if (!popover) {
      return;
    }

    const popoverRect = popover.getBoundingClientRect();
    let x = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
    x = Math.max(
      POPOVER_VIEWPORT_MARGIN_PX,
      Math.min(x, window.innerWidth - popoverRect.width - POPOVER_VIEWPORT_MARGIN_PX),
    );

    const above = anchorRect.top >= MIN_SPACE_ABOVE_PX;

    let y: number;
    if (above) {
      y = anchorRect.top - popoverRect.height - ARROW_HEIGHT_PX;
      this.arrowAbove.set(true);
    } else {
      y = anchorRect.bottom + ARROW_HEIGHT_PX;
      this.arrowAbove.set(false);
    }

    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    this.arrowX.set(
      Math.max(
        ARROW_MIN_INSET_PX,
        Math.min(anchorCenterX - x - ARROW_HALF_WIDTH_PX, popoverRect.width - ARROW_MAX_INSET_PX),
      ),
    );

    this.posX.set(x);
    this.posY.set(y);
  }

  private setupDismissListeners(): void {
    if (!this.isBrowser) {
      return;
    }
    setTimeout(() => {
      document.addEventListener('click', this.outsideClickHandler, true);
      document.addEventListener('scroll', this.scrollHandler, true);
      document.addEventListener('keydown', this.escHandler);
    }, DISMISS_LISTENER_DELAY_MS);
  }

  private teardownDismissListeners(): void {
    if (!this.isBrowser) {
      return;
    }
    document.removeEventListener('click', this.outsideClickHandler, true);
    document.removeEventListener('scroll', this.scrollHandler, true);
    document.removeEventListener('keydown', this.escHandler);
  }

  private onOutsideClick(e: MouseEvent): void {
    const popover = this.popoverEl()?.nativeElement;
    if (popover && !popover.contains(e.target as Node)) {
      this.close();
    }
  }
}
