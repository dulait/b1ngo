import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
import { playerTokenInterceptor } from './player-token.interceptor';
import { AuthService } from '../auth/auth.service';

describe('playerTokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([playerTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  it('should not set withCredentials on requests', () => {
    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });

  it('should add X-Player-Token header when token exists', () => {
    authService.saveSession('r1', 'p1', 'test-token');

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('X-Player-Token')).toBe('test-token');
    req.flush({});

    authService.clearSession();
  });

  it('should not add X-Player-Token header when no token exists', () => {
    authService.clearSession();

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('X-Player-Token')).toBe(false);
    req.flush({});
  });
});
