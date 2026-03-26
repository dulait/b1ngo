import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from 'bng-ui';
import { SessionService } from '../auth/session.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 0:
          toast.error('Network error. Check your connection.');
          break;
        case 401:
          if (req.url.includes('/api/v1/auth/me')) {
            break;
          }
          auth.clearSession();
          router.navigate(['/']);
          toast.warning(err.error?.message ?? 'Your session has expired.');
          break;
        case 403:
          router.navigate(['/']);
          toast.warning("You're not a member of this room.");
          break;
        case 404:
          toast.error(err.error?.message ?? 'Not found.');
          break;
        case 409:
          toast.error(err.error?.message ?? 'Conflict.');
          break;
        case 400:
          toast.error(err.error?.message ?? 'Invalid request.');
          break;
        case 429:
          toast.warning('Too many requests. Please wait a moment.');
          break;
        default:
          if (err.status >= 500) {
            toast.error(err.error?.message ?? 'Something went wrong. Please try again.');
          }
      }

      return throwError(() => err);
    }),
  );
};
