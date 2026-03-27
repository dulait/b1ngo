import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let router: Router;

  async function createComponent(queryParams: Record<string, string | null> = {}) {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
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

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects to /auth/forgot-password when token and email query params are missing', async () => {
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

  it('sets success() to true after valid submit', async () => {
    await createComponent({ token: 'abc', email: 'test@test.com' });

    component.newPassword.set('Password1');
    component.confirmPassword.set('Password1');

    expect(component.success()).toBe(false);
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.success()).toBe(true);
  });
});
