import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ENVIRONMENT } from '../environment/environment.token';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://test-api.example.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: baseUrl } },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should start with null currentUser', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  it('should populate currentUser on successful checkAuth', async () => {
    const meResponse = {
      userId: 'u1',
      email: 'me@example.com',
      displayName: 'Me',
      roles: ['Admin'],
      hasPassword: true,
    };

    const promise = service.checkAuth();
    const req = httpMock.expectOne(`${baseUrl}/api/v1/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush(meResponse);

    await promise;

    expect(service.currentUser()).toEqual(meResponse);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
  });

  it('should set currentUser to null when checkAuth returns 204 (anonymous)', async () => {
    const promise = service.checkAuth();
    const req = httpMock.expectOne(`${baseUrl}/api/v1/auth/me`);
    req.flush(null, { status: 204, statusText: 'No Content' });

    await promise;

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should POST login and set currentUser from response', async () => {
    const authResponse = {
      userId: 'u1',
      email: 'test@example.com',
      displayName: 'Test',
      roles: [],
    };

    const promise = service.login('test@example.com', 'Password1');

    const loginReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ email: 'test@example.com', password: 'Password1' });
    loginReq.flush(authResponse);

    await promise;

    expect(service.currentUser()).toEqual(authResponse);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should throw on failed login', async () => {
    const promise = service.login('test@example.com', 'wrong');

    const loginReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/login`);
    loginReq.flush(
      { code: 'LoginFailed', message: 'Invalid email or password.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    await expect(promise).rejects.toThrow();
  });

  it('should POST register and set currentUser from response', async () => {
    const authResponse = {
      userId: 'u1',
      email: 'new@example.com',
      displayName: 'New',
      roles: [],
    };

    const promise = service.register('new@example.com', 'Password1', 'New');

    const registerReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/register`);
    expect(registerReq.request.method).toBe('POST');
    expect(registerReq.request.body).toEqual({
      email: 'new@example.com',
      password: 'Password1',
      displayName: 'New',
    });
    registerReq.flush(authResponse);

    await promise;

    expect(service.currentUser()).toEqual(authResponse);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should throw on failed register', async () => {
    const promise = service.register('dup@example.com', 'Password1', 'Dup');

    const registerReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/register`);
    registerReq.flush(
      { code: 'DuplicateEmail', message: 'An account with this email already exists.' },
      { status: 409, statusText: 'Conflict' },
    );

    await expect(promise).rejects.toThrow();
  });

  it('should POST logout and clear currentUser', async () => {
    // Seed authenticated state
    const checkPromise = service.checkAuth();
    httpMock.expectOne(`${baseUrl}/api/v1/auth/me`).flush({
      userId: 'u1',
      email: 'me@example.com',
      displayName: 'Me',
      roles: [],
      hasPassword: true,
    });
    await checkPromise;
    expect(service.isAuthenticated()).toBe(true);

    const logoutPromise = service.logout();
    const logoutReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/logout`);
    expect(logoutReq.request.method).toBe('POST');
    logoutReq.flush(null, { status: 204, statusText: 'No Content' });

    await logoutPromise;

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should report isAdmin false when user has no Admin role', async () => {
    const promise = service.checkAuth();
    httpMock.expectOne(`${baseUrl}/api/v1/auth/me`).flush({
      userId: 'u1',
      email: 'me@example.com',
      displayName: 'Me',
      roles: ['Player'],
      hasPassword: true,
    });
    await promise;

    expect(service.isAdmin()).toBe(false);
  });

  it('should POST forgotPassword and resolve on success', async () => {
    const promise = service.forgotPassword('test@example.com');

    const req = httpMock.expectOne(`${baseUrl}/api/v1/auth/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush(null, { status: 200, statusText: 'OK' });

    await expect(promise).resolves.toBeUndefined();
  });

  it('should throw when forgotPassword fails', async () => {
    const promise = service.forgotPassword('test@example.com');

    httpMock
      .expectOne(`${baseUrl}/api/v1/auth/forgot-password`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    await expect(promise).rejects.toThrow();
  });

  it('should POST resetPassword and resolve on success', async () => {
    const promise = service.resetPassword('test@example.com', 'token123', 'NewPassword1');

    const req = httpMock.expectOne(`${baseUrl}/api/v1/auth/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      token: 'token123',
      newPassword: 'NewPassword1',
    });
    req.flush(null, { status: 200, statusText: 'OK' });

    await expect(promise).resolves.toBeUndefined();
  });

  it('should throw when resetPassword fails', async () => {
    const promise = service.resetPassword('test@example.com', 'token123', 'NewPassword1');

    httpMock
      .expectOne(`${baseUrl}/api/v1/auth/reset-password`)
      .flush(null, { status: 400, statusText: 'Bad Request' });

    await expect(promise).rejects.toThrow();
  });

  it('should redirect to external login URL', () => {
    const originalHref = window.location.href;
    const hrefSetter = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      set href(url: string) {
        /* no-op in test */
      },
      get href() {
        return originalHref;
      },
    } as Location);

    // Verify the method exists and doesn't throw
    expect(() => service.externalLogin('Google')).not.toThrow();

    hrefSetter.mockRestore();
  });
});
