import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from 'bng-ui';
import { SessionService } from '../auth/session.service';
import { AuthService } from '../auth/auth.service';

interface ErrorContext {
  err: HttpErrorResponse;
  toast: ToastService;
  session: SessionService;
  auth: AuthService;
  router: Router;
  isAuthUrl: boolean;
}

type ErrorHandler = (ctx: ErrorContext) => void;

const handleNetworkError: ErrorHandler = ({ toast }) =>
  toast.error('Network error. Check your connection.');

const handle400: ErrorHandler = ({ err, toast }) =>
  toast.error(err.error?.message ?? 'Invalid request.');

const handle401: ErrorHandler = ({ err, toast, session, auth, router, isAuthUrl }) => {
  if (isAuthUrl) {
    auth.currentUser.set(null);
    toast.warning(err.error?.message ?? 'Authentication failed.');
    return;
  }

  if (!auth.isAuthenticated()) {
    session.clearSession();
  }
  router.navigate(['/']);
  toast.warning(err.error?.message ?? 'Your session has expired.');
};

const handle403: ErrorHandler = ({ err, toast, router }) => {
  router.navigate(['/']);
  toast.warning(err.error?.message ?? 'Access denied.');
};

const handle404: ErrorHandler = ({ err, toast }) =>
  toast.error(err.error?.message ?? 'Not found.');

const handle409: ErrorHandler = ({ err, toast }) =>
  toast.error(err.error?.message ?? 'Conflict.');

const handle429: ErrorHandler = ({ toast }) =>
  toast.warning('Too many requests. Please wait a moment.');

const handleServerError: ErrorHandler = ({ err, toast }) =>
  toast.error(err.error?.message ?? 'Something went wrong. Please try again.');

const handlers: Record<number, ErrorHandler> = {
  0: handleNetworkError,
  400: handle400,
  401: handle401,
  403: handle403,
  404: handle404,
  409: handle409,
  429: handle429,
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && req.url.includes('/api/v1/auth/me')) {
        return throwError(() => err);
      }

      const ctx: ErrorContext = {
        err,
        toast,
        session,
        auth,
        router,
        isAuthUrl: req.url.includes('/api/v1/auth/'),
      };

      const handler = handlers[err.status];
      if (handler) {
        handler(ctx);
      } else if (err.status >= 500) {
        handleServerError(ctx);
      }

      return throwError(() => err);
    }),
  );
};
