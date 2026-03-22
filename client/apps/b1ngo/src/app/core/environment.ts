import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  version: string;
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
