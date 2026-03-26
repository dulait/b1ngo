import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from 'bng-ui';
import { SessionService } from './session.service';

export const roomGuard: CanActivateFn = () => {
  const auth = inject(SessionService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.hasSession()) {
    return true;
  }

  toast.warning('Join a room first.');
  return router.parseUrl('/');
};
