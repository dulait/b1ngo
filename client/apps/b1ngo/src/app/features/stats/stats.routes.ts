import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const STATS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./stats.component').then((m) => m.StatsComponent),
  },
];
