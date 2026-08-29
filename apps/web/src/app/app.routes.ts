import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lab' },
  {
    path: 'lab',
    loadComponent: () =>
      import('./features/lab/pages/lab-page/lab-page.component').then((m) => m.LabPageComponent)
  },
  {
    path: 'learn',
    loadComponent: () =>
      import('./features/learn/pages/learn-page/learn-page.component').then(
        (m) => m.LearnPageComponent
      )
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/pages/account-page/account-page.component').then(
        (m) => m.AccountPageComponent
      )
  },
  { path: '**', redirectTo: 'lab' }
];
