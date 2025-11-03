import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
  },

  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
];
