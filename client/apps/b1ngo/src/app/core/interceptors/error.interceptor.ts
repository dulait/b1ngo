import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from 'bng-ui';
import { SessionService } from '../auth/session.service';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // /auth/me is a silent status check, not a user-facing error
      if (req.url.includes('/api/v1/auth/me')) {
        return throwError(() => err);
      }

      const isAuthUrl = req.url.includes('/api/v1/auth/');

      switch (err.status) {
        case 0:
          toast.error('Network error. Check your connection.');
          break;
        case 400:
          // Future hook: suppress toast when err.error?.details?.length > 0
          // (code: "validation_error") so the form can handle inline field errors.
          toast.error(err.error?.message ?? 'Invalid request.');
          break;
        case 401:
          if (isAuthUrl) {
            auth.currentUser.set(null);
            toast.warning(err.error?.message ?? 'Authentication failed.');
          } else {
            if (!auth.isAuthenticated()) {
              session.clearSession();
            }
            router.navigate(['/']);
            toast.warning(err.error?.message ?? 'Your session has expired.');
          }
          break;
        case 403:
          router.navigate(['/']);
          toast.warning(err.error?.message ?? "You're not a member of this room.");
          break;
        case 404:
          toast.error(err.error?.message ?? 'Not found.');
          break;
        case 409:
          toast.error(err.error?.message ?? 'Conflict.');
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
