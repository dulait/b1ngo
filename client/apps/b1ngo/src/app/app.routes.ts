import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'auth',
    data: { hideHeader: true },
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'profile',
    data: { hideHeader: true },
    loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
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
    loadChildren: () => import('./features/room/room.routes').then((m) => m.ROOM_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
