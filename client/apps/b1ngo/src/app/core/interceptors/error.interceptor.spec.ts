import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { errorInterceptor } from './error.interceptor';
import { SessionService } from '../auth/session.service';
import { AuthService } from '../auth/auth.service';
import { ENVIRONMENT } from '../environment/environment.token';
import { ToastService } from 'bng-ui';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastService: ToastService;
  let authService: SessionService;
  let identityAuth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        SessionService,
        AuthService,
        ToastService,
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService);
    authService = TestBed.inject(SessionService);
    identityAuth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should show network error toast on status 0', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    http.get('/test').subscribe({ error: () => {} });
    httpMock.expectOne('/test').error(new ProgressEvent('error'), { status: 0 });

    expect(errorSpy).toHaveBeenCalledWith('Network error. Check your connection.');
  });

  it('should clear session and redirect on 401', () => {
    authService.saveSession('r1', 'p1', 'tok');
    const warnSpy = vi.spyOn(toastService, 'warning');
    const clearSpy = vi.spyOn(authService, 'clearSession');

    http.get('/test').subscribe({ error: () => {} });
    httpMock.expectOne('/test').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(clearSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(warnSpy).toHaveBeenCalledWith('Your session has expired.');
  });

  it('should not clear session or toast on 401 from auth/me', () => {
    authService.saveSession('r1', 'p1', 'tok');
    const warnSpy = vi.spyOn(toastService, 'warning');
    const clearSpy = vi.spyOn(authService, 'clearSession');

    http.get('/api/v1/auth/me').subscribe({ error: () => {} });
    httpMock.expectOne('/api/v1/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(clearSpy).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not have any side effects on 401 from /api/v1/auth/me', () => {
    authService.saveSession('r1', 'p1', 'tok');
    identityAuth.currentUser.set({
      userId: '1',
      email: 'test@test.com',
      displayName: 'Test',
      roles: [],
    });
    const warnSpy = vi.spyOn(toastService, 'warning');
    const clearSpy = vi.spyOn(authService, 'clearSession');
    const currentUserSpy = vi.spyOn(identityAuth.currentUser, 'set');

    http.get('/api/v1/auth/me').subscribe({ error: () => {} });
    httpMock.expectOne('/api/v1/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(clearSpy).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(currentUserSpy).not.toHaveBeenCalled();
  });

  it('should clear currentUser and toast on 401 from /api/v1/auth/login', () => {
    authService.saveSession('r1', 'p1', 'tok');
    identityAuth.currentUser.set({
      userId: '1',
      email: 'test@test.com',
      displayName: 'Test',
      roles: [],
    });
    const warnSpy = vi.spyOn(toastService, 'warning');
    const clearSpy = vi.spyOn(authService, 'clearSession');
    const currentUserSpy = vi.spyOn(identityAuth.currentUser, 'set');

    http.post('/api/v1/auth/login', {}).subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/v1/auth/login')
      .flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(currentUserSpy).toHaveBeenCalledWith(null);
    expect(clearSpy).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should clear currentUser and toast on 401 from /api/v1/auth/logout', () => {
    authService.saveSession('r1', 'p1', 'tok');
    identityAuth.currentUser.set({
      userId: '1',
      email: 'test@test.com',
      displayName: 'Test',
      roles: [],
    });
    const warnSpy = vi.spyOn(toastService, 'warning');
    const clearSpy = vi.spyOn(authService, 'clearSession');
    const currentUserSpy = vi.spyOn(identityAuth.currentUser, 'set');

    http.post('/api/v1/auth/logout', {}).subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/v1/auth/logout')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(currentUserSpy).toHaveBeenCalledWith(null);
    expect(clearSpy).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('Authentication failed.');
  });

  it('should clear session and navigate on 401 from game endpoint', () => {
    authService.saveSession('r1', 'p1', 'tok');
    const warnSpy = vi.spyOn(toastService, 'warning');
    const clearSpy = vi.spyOn(authService, 'clearSession');

    http.get('/api/v1/rooms/123').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/v1/rooms/123')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(clearSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(warnSpy).toHaveBeenCalledWith('Your session has expired.');
  });

  it('should redirect and warn on 403', () => {
    const warnSpy = vi.spyOn(toastService, 'warning');

    http.get('/test').subscribe({ error: () => {} });
    httpMock
      .expectOne('/test')
      .flush({ message: 'Not a member' }, { status: 403, statusText: 'Forbidden' });

    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(warnSpy).toHaveBeenCalledWith('Not a member');
  });

  it('should show server error message on 400', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    http.get('/test').subscribe({ error: () => {} });
    httpMock
      .expectOne('/test')
      .flush({ message: 'Bad field' }, { status: 400, statusText: 'Bad Request' });

    expect(errorSpy).toHaveBeenCalledWith('Bad field');
  });

  it('should toast on 400 from auth endpoint', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    http.post('/api/v1/auth/register', {}).subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/v1/auth/register')
      .flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });

    expect(errorSpy).toHaveBeenCalledWith('Validation failed');
  });

  it('should toast on 409 from auth endpoint', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    http.post('/api/v1/auth/register', {}).subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/v1/auth/register')
      .flush({ message: 'Duplicate email' }, { status: 409, statusText: 'Conflict' });

    expect(errorSpy).toHaveBeenCalledWith('Duplicate email');
  });

  it('should show generic error on 500+', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    http.get('/test').subscribe({ error: () => {} });
    httpMock.expectOne('/test').flush(null, { status: 500, statusText: 'Server Error' });

    expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again.');
  });

  it('should show error toast on 404', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    http.get('/test').subscribe({ error: () => {} });
    httpMock.expectOne('/test').flush(null, { status: 404, statusText: 'Not Found' });

    expect(errorSpy).toHaveBeenCalledWith('Not found.');
  });
});
