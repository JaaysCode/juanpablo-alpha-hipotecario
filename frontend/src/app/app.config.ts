import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { CLIENT_REPOSITORY_PORT } from './features/clients/ports/outbound/client-repository.port';
import { LOAN_REPOSITORY_PORT } from './features/loans/ports/outbound/loan-repository.port';
import { HttpClientRepository } from './features/clients/infrastructure/adapters/http/http-client.repository';
import { HttpLoanRepository } from './features/loans/infrastructure/adapters/http/http-loan.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: CLIENT_REPOSITORY_PORT, useClass: HttpClientRepository },
    { provide: LOAN_REPOSITORY_PORT, useClass: HttpLoanRepository },
  ],
};
