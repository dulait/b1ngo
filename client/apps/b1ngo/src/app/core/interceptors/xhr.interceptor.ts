import { HttpInterceptorFn } from '@angular/common/http';

export const xhrInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST' && req.url.includes('/api/v1/auth/')) {
    return next(req.clone({ setHeaders: { 'X-Requested-With': 'XMLHttpRequest' } }));
  }

  return next(req);
};
