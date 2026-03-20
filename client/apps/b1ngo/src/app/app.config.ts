import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { ENVIRONMENT } from './core/environment';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AppErrorHandler } from './core/error/error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor, errorInterceptor])),
    { provide: ENVIRONMENT, useValue: environment },
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
};
