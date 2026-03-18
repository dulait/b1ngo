import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from 'bng-ui';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 0:
          toast.error('Network error. Check your connection.');
          break;
        case 401:
          auth.clearSession();
          router.navigate(['/']);
          toast.warning('Your session has expired.');
          break;
        case 403:
          router.navigate(['/']);
          toast.warning("You're not a member of this room.");
          break;
        case 404:
          break; // Context-dependent, let the caller handle it
        case 409:
          toast.error(err.error?.message ?? 'Conflict.');
          break;
        case 400:
          toast.error(err.error?.message ?? 'Invalid request.');
          break;
        default:
          if (err.status >= 500) {
            toast.error('Something went wrong. Try again.');
          }
      }

      return throwError(() => err);
    }),
  );
};
