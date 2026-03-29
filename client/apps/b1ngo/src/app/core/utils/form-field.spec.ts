import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { formField } from './form-field';

describe('formField', () => {
  let field: ReturnType<typeof formField>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.runInInjectionContext(() => {
      field = formField();
    });
  });

  it('should initialize with empty value and no error', () => {
    expect(field.value()).toBe('');
    expect(field.error()).toBeNull();
  });

  it('should initialize with a custom initial value', () => {
    TestBed.runInInjectionContext(() => {
      const custom = formField('hello');
      expect(custom.value()).toBe('hello');
    });
  });

  it('should update value on set', () => {
    field.set('new value');
    expect(field.value()).toBe('new value');
  });

  it('should clear error when set is called with a non-empty trimmed value', () => {
    field.error.set('Some error');
    field.set('valid');
    expect(field.error()).toBeNull();
  });

  it('should not clear error when set is called with a whitespace-only value', () => {
    field.error.set('Some error');
    field.set('   ');
    expect(field.error()).toBe('Some error');
  });

  it('should not clear error when there is no existing error', () => {
    field.set('value');
    expect(field.error()).toBeNull();
  });

  it('should reset value and error', () => {
    field.set('dirty');
    field.error.set('Some error');

    field.reset();

    expect(field.value()).toBe('');
    expect(field.error()).toBeNull();
  });

  it('should reset to a custom value', () => {
    field.set('dirty');
    field.error.set('Some error');

    field.reset('custom');

    expect(field.value()).toBe('custom');
    expect(field.error()).toBeNull();
  });
});
