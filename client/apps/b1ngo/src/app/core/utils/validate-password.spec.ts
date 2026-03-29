import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { validatePassword } from './validate-password';

describe('validatePassword', () => {
  let error: ReturnType<typeof signal<string | null>>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.runInInjectionContext(() => {
      error = signal<string | null>(null);
    });
  });

  it('should return false and set error when empty', () => {
    expect(validatePassword('', error)).toBe(false);
    expect(error()).toBe('Password is required.');
  });

  it('should return false and set error when shorter than 8 characters', () => {
    expect(validatePassword('Short1', error)).toBe(false);
    expect(error()).toBe('Password must be at least 8 characters.');
  });

  it('should return false and set error when missing a digit', () => {
    expect(validatePassword('abcdefgh', error)).toBe(false);
    expect(error()).toBe('Password must contain at least one digit.');
  });

  it('should return true and not set error for a valid password', () => {
    expect(validatePassword('password1', error)).toBe(true);
    expect(error()).toBeNull();
  });

  it('should accept exactly 8 characters with a digit', () => {
    expect(validatePassword('abcdefg1', error)).toBe(true);
    expect(error()).toBeNull();
  });
});
