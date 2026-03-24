import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { AppErrorHandler } from './global-error.handler';
import { ToastService } from 'bng-ui';

describe('AppErrorHandler', () => {
  let handler: AppErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppErrorHandler, ToastService],
    });
    handler = TestBed.inject(AppErrorHandler);
  });

  it('should log unhandled errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(new Error('test error'));

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should not toast for HttpErrorResponse (handled by interceptor)', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const toastService = TestBed.inject(ToastService);
    const errorSpy = vi.spyOn(toastService, 'error');

    handler.handleError(new HttpErrorResponse({ status: 500 }));

    expect(errorSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
