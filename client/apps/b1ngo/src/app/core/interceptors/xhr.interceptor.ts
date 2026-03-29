import { HttpInterceptorFn } from '@angular/common/http';

export const xhrInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthMutation =
    req.url.includes('/api/v1/auth/') &&
    (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE');

  if (!isAuthMutation) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { 'X-Requested-With': 'XMLHttpRequest' } }));
};
