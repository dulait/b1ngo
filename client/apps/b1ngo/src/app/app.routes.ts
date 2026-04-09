import { Routes } from '@angular/router';
import { authenticatedMatch } from '@core/auth/authenticated.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [authenticatedMatch],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'auth',
    data: { hideHeader: true, hideTabBar: true },
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'history',
    loadChildren: () =>
      import('./features/history/history.routes').then((m) => m.HISTORY_ROUTES),
  },
  {
    path: 'stats',
    loadChildren: () => import('./features/stats/stats.routes').then((m) => m.STATS_ROUTES),
  },
  {
    path: 'room',
    data: { hideTabBar: true },
    loadChildren: () => import('./features/room/room.routes').then((m) => m.ROOM_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
