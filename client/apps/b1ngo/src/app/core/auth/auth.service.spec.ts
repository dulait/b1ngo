import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
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
    const meResponse = { userId: 'u1', email: 'me@example.com', displayName: 'Me', roles: ['Admin'] };

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

  it('should POST login and then call checkAuth', async () => {
    const authResponse = { userId: 'u1', email: 'test@example.com', displayName: 'Test' };
    const meResponse = { userId: 'u1', email: 'test@example.com', displayName: 'Test', roles: [] };

    const promise = service.login('test@example.com', 'Password1');

    const loginReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ email: 'test@example.com', password: 'Password1' });
    loginReq.flush(authResponse);

    // After login resolves, checkAuth fires a /me request
    await new Promise((r) => setTimeout(r, 0));
    const meReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/me`);
    meReq.flush(meResponse);

    const result = await promise;

    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should POST register and then call checkAuth', async () => {
    const meResponse = { userId: 'u1', email: 'new@example.com', displayName: 'New', roles: [] };

    const promise = service.register('new@example.com', 'Password1', 'New');

    const registerReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/register`);
    expect(registerReq.request.method).toBe('POST');
    expect(registerReq.request.body).toEqual({ email: 'new@example.com', password: 'Password1', displayName: 'New' });
    registerReq.flush({ userId: 'u1', email: 'new@example.com', displayName: 'New' });

    // After register resolves, checkAuth fires a /me request
    await new Promise((r) => setTimeout(r, 0));
    const meReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/me`);
    meReq.flush(meResponse);

    const result = await promise;

    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should POST logout and clear currentUser', async () => {
    // Seed authenticated state
    const checkPromise = service.checkAuth();
    httpMock.expectOne(`${baseUrl}/api/v1/auth/me`).flush({
      userId: 'u1', email: 'me@example.com', displayName: 'Me', roles: [],
    });
    await checkPromise;
    expect(service.isAuthenticated()).toBe(true);

    const logoutPromise = service.logout();
    const logoutReq = httpMock.expectOne(`${baseUrl}/api/v1/auth/logout`);
    expect(logoutReq.request.method).toBe('POST');
    logoutReq.flush(null, { status: 204, statusText: 'No Content' });

    const result = await logoutPromise;

    expect(result).toBe(true);
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should report isAdmin false when user has no Admin role', async () => {
    const promise = service.checkAuth();
    httpMock.expectOne(`${baseUrl}/api/v1/auth/me`).flush({
      userId: 'u1', email: 'me@example.com', displayName: 'Me', roles: ['Player'],
    });
    await promise;

    expect(service.isAdmin()).toBe(false);
  });
});
