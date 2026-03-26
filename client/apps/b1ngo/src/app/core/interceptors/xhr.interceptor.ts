import { HttpInterceptorFn } from '@angular/common/http';

export const xhrInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/v1/auth/')) {
    return next(req.clone({ setHeaders: { 'X-Requested-With': 'XMLHttpRequest' } }));
  }

  return next(req);
};
