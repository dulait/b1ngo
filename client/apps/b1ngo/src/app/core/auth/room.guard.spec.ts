import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { roomGuard } from './room.guard';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { ToastService } from 'bng-ui';
import { ENVIRONMENT } from '../environment/environment.token';

describe('roomGuard', () => {
  let session: SessionService;
  let auth: AuthService;
  let router: Router;
  let toastService: ToastService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SessionService,
        ToastService,
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
        {
          provide: Router,
          useValue: { parseUrl: vi.fn().mockReturnValue('/') },
        },
      ],
    });

    session = TestBed.inject(SessionService);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    toastService = TestBed.inject(ToastService);
  });

  it('should allow access when session exists', () => {
    session.saveSession('r1', 'p1', 'tok');

    const result = TestBed.runInInjectionContext(() =>
      roomGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('should allow access when user is authenticated', () => {
    auth.currentUser.set({ userId: 'u1', email: 'test@example.com', displayName: 'Test', roles: [], hasPassword: true });

    const result = TestBed.runInInjectionContext(() =>
      roomGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('should redirect to home when no session and not authenticated', () => {
    const warnSpy = vi.spyOn(toastService, 'warning');

    const result = TestBed.runInInjectionContext(() =>
      roomGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
    );

    expect(result).toBe('/');
    expect(router.parseUrl).toHaveBeenCalledWith('/');
    expect(warnSpy).toHaveBeenCalledWith('Join a room first.');
  });
});
