import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const HISTORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./history.component').then((m) => m.HistoryComponent),
  },
];
