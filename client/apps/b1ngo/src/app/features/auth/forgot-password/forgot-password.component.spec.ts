import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, beforeEach, expect } from 'vitest';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders email input field and submit button', () => {
    const inputs = fixture.nativeElement.querySelectorAll('bng-input');
    expect(inputs.length).toBeGreaterThanOrEqual(1);

    const buttons = fixture.nativeElement.querySelectorAll('bng-button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Email is required." when submitting with empty email', async () => {
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.email.error()).toBe('Email is required.');
  });

  it('sets sent() to true after successful submit', async () => {
    component.email.set('user@example.com');

    expect(component.sent()).toBe(false);
    const submitPromise = component.onSubmit();
    await submitPromise;
    fixture.detectChanges();

    expect(component.sent()).toBe(true);
  });
});
