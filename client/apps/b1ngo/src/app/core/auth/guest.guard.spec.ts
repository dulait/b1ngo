import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { guestGuard } from './guest.guard';
import { AuthService } from './auth.service';
import { ENVIRONMENT } from '../environment/environment.token';

describe('guestGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(
              (segments: string[]) =>
                ({ toString: () => segments.join('/') }) as unknown as UrlTree,
            ),
          },
        },
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should return true when user is not authenticated', () => {
    authService.currentUser.set(null);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('should redirect to / when user is authenticated', () => {
    authService.currentUser.set({
      userId: 'u1',
      email: 'test@test.com',
      displayName: 'Test',
      roles: [],
    });

    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
