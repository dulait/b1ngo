import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../auth/session.service';

export const playerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const session = inject(SessionService);

  if (auth.isAuthenticated()) {
    return next(req);
  }

  const token = session.getPlayerToken();
  if (token) {
    return next(req.clone({ setHeaders: { 'X-Player-Token': token } }));
  }

  return next(req);
};
