import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
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
