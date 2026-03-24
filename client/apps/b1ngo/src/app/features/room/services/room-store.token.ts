import { InjectionToken } from '@angular/core';
import { RoomStore } from './room.store';

export const ROOM_STORE = new InjectionToken<RoomStore>('RoomStore');
