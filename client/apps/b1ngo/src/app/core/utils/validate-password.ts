import { WritableSignal } from '@angular/core';

const MIN_LENGTH = 8;
const DIGIT_PATTERN = /\d/;

export function validatePassword(value: string, error: WritableSignal<string | null>): boolean {
  if (!value) {
    error.set('Password is required.');
    return false;
  }
  if (value.length < MIN_LENGTH) {
    error.set('Password must be at least 8 characters.');
    return false;
  }
  if (!DIGIT_PATTERN.test(value)) {
    error.set('Password must contain at least one digit.');
    return false;
  }
  return true;
}
