import { InjectionToken } from '@angular/core';
import { Environment } from './environment.interface';

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
