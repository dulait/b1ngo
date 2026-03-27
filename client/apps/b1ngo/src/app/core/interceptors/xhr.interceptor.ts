import { HttpInterceptorFn } from '@angular/common/http';

export const xhrInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ setHeaders: { 'X-Requested-With': 'XMLHttpRequest' } }));
};
