import { Routes } from '@angular/router';
import { roomGuard } from '../../core/auth/room.guard';

export const ROOM_ROUTES: Routes = [
  {
    path: ':roomId',
    loadComponent: () => import('./room').then((m) => m.Room),
    canActivate: [roomGuard],
  },
];
