import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiBaseUrl: string;
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
