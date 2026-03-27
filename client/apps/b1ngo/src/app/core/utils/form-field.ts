import { signal } from '@angular/core';

export function formField(initialValue = '') {
  const value = signal(initialValue);
  const error = signal<string | null>(null);

  return {
    value,
    error,
    set(v: string) {
      value.set(v);
      if (error() && v.trim()) {
        error.set(null);
      }
    },
    reset(v = '') {
      value.set(v);
      error.set(null);
    },
  };
}
