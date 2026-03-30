import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '@core/auth/auth.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: AuthService;
  let router: Router;

  async function createComponent(queryParams: Record<string, string | null> = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => queryParams[key] ?? null,
              },
              data: {},
            },
          },
        },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects to /auth/forgot-password when token and email are missing', async () => {
    await createComponent({});

    expect(router.navigate).toHaveBeenCalledWith(
      ['/auth/forgot-password'],
      expect.objectContaining({ replaceUrl: true }),
    );
  });

  it('redirects to /auth/forgot-password when only token is missing', async () => {
    await createComponent({ email: 'test@test.com' });

    expect(router.navigate).toHaveBeenCalledWith(
      ['/auth/forgot-password'],
      expect.objectContaining({ replaceUrl: true }),
    );
  });

  it('renders password and confirm password fields when params are present', async () => {
    await createComponent({ token: 'abc', email: 'test@test.com' });

    const inputs = fixture.nativeElement.querySelectorAll('bng-input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    await createComponent({ token: 'abc', email: 'test@test.com' });

    component.newPassword.set('Password1');
    component.confirmPassword.set('Different1');
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.confirmPassword.error()).toBe('Passwords do not match.');
  });

  it('sets success to true after valid submit', async () => {
    await createComponent({ token: 'abc', email: 'test@test.com' });
    vi.spyOn(authService, 'resetPassword').mockResolvedValue();

    component.newPassword.set('Password1');
    component.confirmPassword.set('Password1');
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.success()).toBe(true);
  });

  it('does not set success when reset fails', async () => {
    await createComponent({ token: 'abc', email: 'test@test.com' });
    vi.spyOn(authService, 'resetPassword').mockRejectedValue(new Error('fail'));

    component.newPassword.set('Password1');
    component.confirmPassword.set('Password1');
    await component.onSubmit();

    expect(component.success()).toBe(false);
  });
});
