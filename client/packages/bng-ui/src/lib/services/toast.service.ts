import { Injectable, signal, computed } from '@angular/core';
import { ToastData, ToastVariant } from '../types';

const MAX_VISIBLE = 3;
const DEFAULT_DURATION_MS = 4000;
const EXIT_ANIMATION_MS = 200;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<ToastData[]>([]);

  readonly toasts = computed(() => this._toasts().slice(0, MAX_VISIBLE));

  show(message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION_MS): string {
    const id = `toast-${++this.nextId}`;
    const toast: ToastData = { id, message, variant, duration, dismissing: false };

    this._toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration);
  }

  dismiss(id: string): void {
    // Mark as dismissing to trigger exit animation
    this._toasts.update((current) =>
      current.map((t) => (t.id === id ? { ...t, dismissing: true } : t)),
    );
    // Remove after exit animation completes
    setTimeout(() => {
      this._toasts.update((current) => current.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }

  clear(): void {
    this._toasts.set([]);
  }
}
