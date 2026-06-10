import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/clients', pathMatch: 'full' },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/components/client-list/client-list').then((m) => m.ClientListComponent),
  },
  {
    path: 'clients/new',
    loadComponent: () =>
      import('./features/clients/components/client-create/client-create').then((m) => m.ClientCreateComponent),
  },
  {
    path: 'clients/:id',
    loadComponent: () =>
      import('./features/clients/components/client-detail/client-detail').then((m) => m.ClientDetailComponent),
  },
  {
    path: 'loans/simulate',
    loadComponent: () =>
      import('./features/loans/components/loan-simulate/loan-simulate').then((m) => m.LoanSimulateComponent),
  },
  {
    path: 'loans/:id',
    loadComponent: () =>
      import('./features/loans/components/loan-detail/loan-detail').then((m) => m.LoanDetailComponent),
  },
  { path: '**', redirectTo: '/clients' },
];
