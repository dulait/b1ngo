import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { roomGuard } from './room.guard';
import { SessionService } from './session.service';
import { ToastService } from 'bng-ui';

describe('roomGuard', () => {
  let authService: SessionService;
  let router: Router;
  let toastService: ToastService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        ToastService,
        {
          provide: Router,
          useValue: { parseUrl: vi.fn().mockReturnValue('/') },
        },
      ],
    });

    authService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    toastService = TestBed.inject(ToastService);
  });

  it('should allow access when session exists', () => {
    authService.saveSession('r1', 'p1', 'tok');

    const result = TestBed.runInInjectionContext(() =>
      roomGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('should redirect to home when no session', () => {
    const warnSpy = vi.spyOn(toastService, 'warning');

    const result = TestBed.runInInjectionContext(() =>
      roomGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
    );

    expect(result).toBe('/');
    expect(router.parseUrl).toHaveBeenCalledWith('/');
    expect(warnSpy).toHaveBeenCalledWith('Join a room first.');
  });
});
