import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
import { playerTokenInterceptor } from './player-token.interceptor';
import { SessionService } from '../auth/session.service';
import { AuthService } from '../auth/auth.service';
import { ENVIRONMENT } from '../environment/environment.token';

describe('playerTokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let session: SessionService;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([playerTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    auth = TestBed.inject(AuthService);
  });

  it('should add X-Player-Token header for anonymous users with a session', () => {
    auth.currentUser.set(null);
    session.saveSession('r1', 'p1', 'test-token');

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('X-Player-Token')).toBe('test-token');
    req.flush({});

    session.clearSession();
  });

  it('should not add X-Player-Token header when no session exists', () => {
    auth.currentUser.set(null);
    session.clearSession();

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('X-Player-Token')).toBe(false);
    req.flush({});
  });

  it('should not add X-Player-Token header for authenticated users', () => {
    auth.currentUser.set({ userId: 'u1', email: 'test@example.com', displayName: 'Test', roles: [] });
    session.saveSession('r1', 'p1', 'test-token');

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('X-Player-Token')).toBe(false);
    req.flush({});

    session.clearSession();
    auth.currentUser.set(null);
  });
});
