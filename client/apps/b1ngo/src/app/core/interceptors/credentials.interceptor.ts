import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getPlayerToken();

  let clonedReq = req.clone({ withCredentials: true });

  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: { 'X-Player-Token': token },
    });
  }

  return next(clonedReq);
};
