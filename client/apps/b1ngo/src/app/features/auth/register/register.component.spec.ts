import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { RegisterComponent } from './register.component';
import { AuthService } from '@core/auth/auth.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('renders display name, email, and password input fields', () => {
    const inputs = fixture.nativeElement.querySelectorAll('bng-input');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  it('shows required errors for all empty fields on submit', async () => {
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.displayName.error()).toBe('Display name is required.');
    expect(component.email.error()).toBe('Email is required.');
    expect(component.password.error()).toBe('Password is required.');
  });

  it('shows required error for display name when only email and password are filled', async () => {
    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.displayName.error()).toBe('Display name is required.');
  });

  it('calls AuthService.register() with correct arguments on valid submit', async () => {
    const registerSpy = vi.spyOn(authService, 'register').mockResolvedValue();

    component.displayName.set('User');
    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(registerSpy).toHaveBeenCalledWith('user@example.com', 'Password1', 'User');
  });

  it('navigates to / on successful registration', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue();

    component.displayName.set('User');
    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('does not navigate on failed registration', async () => {
    vi.spyOn(authService, 'register').mockRejectedValue({
      error: { code: 'DuplicateEmail', message: 'An account with this email already exists.' },
    });

    component.displayName.set('User');
    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
