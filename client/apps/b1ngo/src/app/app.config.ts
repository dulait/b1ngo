import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { ENVIRONMENT } from './core/environment/environment.token';
import { playerTokenInterceptor } from './core/interceptors/player-token.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AppErrorHandler } from './core/error/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([playerTokenInterceptor, errorInterceptor])),
    { provide: ENVIRONMENT, useValue: environment },
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
};
