import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import { BngIconComponent } from '../../icons/icon.component';
import {
  bngIconInfoCircle,
  bngIconCheckCircle,
  bngIconAlertTriangle,
  bngIconXCircle,
  bngIconX,
} from '../../icons/icons';
import { ToastService } from '../../services/toast.service';
import { ToastVariant } from '../../types';

const SWIPE_DISMISS_THRESHOLD_PX = 80;
const SWIPE_OPACITY_DIVISOR = 200;

@Component({
  selector: 'bng-toast-container',
  standalone: true,
  imports: [BngIconComponent],
  template: `
    <div
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 w-full max-w-sm px-4"
      style="top: calc(16px + env(safe-area-inset-top, 0px))"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          [attr.aria-live]="
            toast.variant === 'warning' || toast.variant === 'error' ? 'assertive' : 'polite'
          "
          class="bg-bg-surface-elevated rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col touch-pan-y"
          [style.animation]="
            toast.dismissing
              ? 'toast-exit 200ms cubic-bezier(0.21, 1.02, 0.73, 1) forwards'
              : 'toast-enter 300ms cubic-bezier(0.21, 1.02, 0.73, 1)'
          "
          (pointerdown)="onSwipeStart($event)"
          (pointermove)="onSwipeMove($event)"
          (pointerup)="onSwipeEnd(toast.id)"
          (pointercancel)="onSwipeReset($event)"
        >
          <div class="flex">
            <div class="w-1.5 shrink-0" [style]="getFlagStyle(toast.variant)"></div>

            <div class="flex-1 flex items-center gap-2.5 px-3 py-2.5">
              <bng-icon
                [icon]="getIcon(toast.variant)"
                size="md"
                class="shrink-0"
                [style.color]="getColor(toast.variant)"
              />
              <span class="text-[13px] font-medium text-text-primary flex-1 leading-tight">{{ toast.message }}</span>
              <button
                class="text-text-disabled hover:text-text-secondary shrink-0 p-0.5"
                aria-label="Dismiss notification"
                (click)="toastService.dismiss(toast.id)"
              >
                <bng-icon [icon]="xIcon" size="md" />
              </button>
            </div>
          </div>

          @if (toast.duration > 0) {
            <div
              class="h-[2px] origin-left"
              [style.backgroundColor]="getColor(toast.variant)"
              [style.animation]="'toast-countdown ' + toast.duration + 'ms linear forwards'"
            ></div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly xIcon = bngIconX;

  private readonly icons: Record<ToastVariant, string> = {
    info: bngIconInfoCircle,
    success: bngIconCheckCircle,
    warning: bngIconAlertTriangle,
    error: bngIconXCircle,
  };

  private readonly colors: Record<ToastVariant, string> = {
    info: 'var(--bng-info)',
    success: 'var(--bng-success)',
    warning: 'var(--bng-warning)',
    error: 'var(--bng-error)',
  };

  private swipeStartX = 0;
  private swipeDelta = 0;
  private swiping = false;

  protected getIcon(variant: ToastVariant): string {
    return this.icons[variant];
  }

  protected getColor(variant: ToastVariant): string {
    return this.colors[variant];
  }

  private readonly flagStyles: Record<ToastVariant, string> = {
    info: 'background: repeating-conic-gradient(var(--bng-info) 0% 25%, transparent 0% 50%) 0 0 / 6px 6px',
    success: 'background-color: var(--bng-success)',
    warning: 'background-color: var(--bng-warning)',
    error: 'background-color: var(--bng-error)',
  };

  protected getFlagStyle(variant: ToastVariant): string {
    return this.flagStyles[variant];
  }

  protected onSwipeStart(event: PointerEvent): void {
    this.swipeStartX = event.clientX;
    this.swipeDelta = 0;
    this.swiping = true;
  }

  protected onSwipeMove(event: PointerEvent): void {
    if (!this.swiping) {
      return;
    }
    const delta = event.clientX - this.swipeStartX;
    this.swipeDelta = Math.max(0, delta);
    const target = event.currentTarget as HTMLElement;
    target.style.transform = `translateX(${this.swipeDelta}px)`;
    target.style.opacity = `${Math.max(0, 1 - this.swipeDelta / SWIPE_OPACITY_DIVISOR)}`;
  }

  protected onSwipeEnd(toastId: string): void {
    if (!this.swiping) {
      return;
    }
    this.swiping = false;
    if (this.swipeDelta >= SWIPE_DISMISS_THRESHOLD_PX) {
      this.toastService.dismiss(toastId);
    }
    this.swipeDelta = 0;
  }

  protected onSwipeReset(event: PointerEvent): void {
    this.swiping = false;
    this.swipeDelta = 0;
    const target = event.currentTarget as HTMLElement;
    target.style.transform = '';
    target.style.opacity = '';
  }
}
