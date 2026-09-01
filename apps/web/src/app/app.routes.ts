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
      import('./features/learn/pages/learn-hub-page/learn-hub-page.component').then(
        (m) => m.LearnHubPageComponent
      )
  },
  {
    path: 'learn/:moduleSlug/:unitSlug',
    loadComponent: () =>
      import('./features/learn/pages/learn-unit-page/learn-unit-page.component').then(
        (m) => m.LearnUnitPageComponent
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
