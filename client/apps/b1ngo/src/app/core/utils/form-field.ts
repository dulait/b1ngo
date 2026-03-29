import { signal, WritableSignal } from '@angular/core';

export interface FormField {
  value: WritableSignal<string>;
  error: WritableSignal<string | null>;
  set: (v: string) => void;
  reset: (v?: string) => void;
}

export function formField(initialValue = ''): FormField {
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
