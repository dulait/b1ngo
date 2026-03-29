import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { SessionService } from '../auth/session.service';

export const playerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.getPlayerToken();

  if (token) {
    return next(req.clone({ setHeaders: { 'X-Player-Token': token } }));
  }

  return next(req);
};
