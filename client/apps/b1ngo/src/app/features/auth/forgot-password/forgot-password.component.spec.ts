import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@core/auth/auth.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
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

  it('shows error when submitting with empty email', async () => {
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.email.error()).toBe('Email is required.');
  });

  it('shows error when email is invalid', async () => {
    component.email.set('notanemail');
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.email.error()).toBe('Enter a valid email address.');
  });

  it('sets sent to true after successful submit', async () => {
    vi.spyOn(authService, 'forgotPassword').mockResolvedValue();
    component.email.set('user@example.com');

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.sent()).toBe(true);
    expect(authService.forgotPassword).toHaveBeenCalledWith('user@example.com');
  });

  it('does not set sent when API fails', async () => {
    vi.spyOn(authService, 'forgotPassword').mockRejectedValue(new Error('fail'));
    component.email.set('user@example.com');

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.sent()).toBe(false);
  });
});
