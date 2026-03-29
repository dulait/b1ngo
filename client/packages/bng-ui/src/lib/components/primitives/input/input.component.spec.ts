import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { BngInputComponent } from './input.component';

describe('BngInputComponent', () => {
  let component: BngInputComponent;
  let fixture: ComponentFixture<BngInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent.trim()).toBe('Test Label');
  });

  it('should render text input by default', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.type).toBe('text');
  });

  it('should show error message', () => {
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('p');
    expect(error.textContent.trim()).toBe('Required field');
    expect(error.className).toContain('text-error');
  });

  it('should show hint message', () => {
    fixture.componentRef.setInput('hint', 'Enter your name');
    fixture.detectChanges();
    const hint = fixture.nativeElement.querySelector('p');
    expect(hint.textContent.trim()).toBe('Enter your name');
  });

  it('should set aria-invalid when error present', () => {
    fixture.componentRef.setInput('error', 'Error');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should emit valueChange on input', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should apply error border class', () => {
    fixture.componentRef.setInput('error', 'Error');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('border-error')).toBe(true);
  });

  describe('password visibility toggle', () => {
    it('should not render toggle button for type="text"', () => {
      fixture.componentRef.setInput('type', 'text');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeNull();
    });

    it('should render toggle button for type="password"', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should change input type from password to text on toggle', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('password');

      const button = fixture.nativeElement.querySelector('button');
      button.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');
    });

    it('should change input type back to password on second toggle', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');

      button.click();
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('password');
    });

    it('should update aria-label on toggle', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toBe('Show password');

      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-label')).toBe('Hide password');
    });

    it('should have tabindex="-1" on toggle button', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('tabindex')).toBe('-1');
    });
  });
});
