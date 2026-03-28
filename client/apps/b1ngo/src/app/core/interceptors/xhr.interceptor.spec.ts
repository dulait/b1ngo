import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
import { xhrInterceptor } from './xhr.interceptor';

describe('xhrInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([xhrInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should add header to POST auth requests', () => {
    http.post('/api/v1/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    req.flush({});
  });

  it('should add header to PUT auth requests', () => {
    http.put('/api/v1/auth/profile', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/profile');
    expect(req.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    req.flush({});
  });

  it('should add header to DELETE auth requests', () => {
    http.delete('/api/v1/auth/account').subscribe();

    const req = httpMock.expectOne('/api/v1/auth/account');
    expect(req.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    req.flush({});
  });

  it('should not add header to GET auth requests', () => {
    http.get('/api/v1/auth/me').subscribe();

    const req = httpMock.expectOne('/api/v1/auth/me');
    expect(req.request.headers.has('X-Requested-With')).toBe(false);
    req.flush({});
  });

  it('should not add header to non-auth requests', () => {
    http.get('/api/v1/rooms').subscribe();

    const req = httpMock.expectOne('/api/v1/rooms');
    expect(req.request.headers.has('X-Requested-With')).toBe(false);
    req.flush({});
  });

  it('should not add header to POST non-auth requests', () => {
    http.post('/api/v1/rooms', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/rooms');
    expect(req.request.headers.has('X-Requested-With')).toBe(false);
    req.flush({});
  });
});
