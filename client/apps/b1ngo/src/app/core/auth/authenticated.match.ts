import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authenticatedMatch: CanMatchFn = () => inject(AuthService).isAuthenticated();
