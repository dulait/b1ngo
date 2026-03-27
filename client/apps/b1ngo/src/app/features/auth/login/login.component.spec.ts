import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/auth/auth.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('renders email and password input fields', () => {
    const inputs = fixture.nativeElement.querySelectorAll('bng-input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('shows "Email is required." when submitting with empty email', async () => {
    component.password.set('somepassword');
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.email.error()).toBe('Email is required.');
  });

  it('shows "Password is required." when submitting with empty password', async () => {
    component.email.set('user@example.com');
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.password.error()).toBe('Password is required.');
  });

  it('calls AuthService.login() with trimmed email and password on valid submit', async () => {
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue({ userId: 'u1', email: 'user@example.com', displayName: 'User' } as never);

    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith('user@example.com', 'Password1');
  });

  it('shows loading state during submit', async () => {
    let capturedLoading = false;
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      capturedLoading = component.loading();
      return { userId: 'u1', email: 'user@example.com', displayName: 'User' } as never;
    });

    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(capturedLoading).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('navigates to / on successful login', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ userId: 'u1', email: 'user@example.com', displayName: 'User' } as never);

    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('does not clear fields when login throws an error', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('Unauthorized'));

    component.email.set('user@example.com');
    component.password.set('Password1');
    await component.onSubmit();

    expect(component.email.value()).toBe('user@example.com');
    expect(component.password.value()).toBe('Password1');
  });
});
