import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from 'bng-ui';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

export const roomGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (session.hasSession() || auth.isAuthenticated()) {
    return true;
  }

  toast.warning('Join a room first.');
  return router.parseUrl('/');
};
