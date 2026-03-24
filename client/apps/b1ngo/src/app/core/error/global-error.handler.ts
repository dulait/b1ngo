import { ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from 'bng-ui';

export class AppErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error('Unhandled error:', error);

    if (error instanceof HttpErrorResponse) {
      return;
    }
  }
}
