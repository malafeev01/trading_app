import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '@/shared';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@/pages/home').then((m) => m.HomeComponent),
    children: [
      {
        // Home stays rendered underneath the deposit modal.
        path: ROUTE_PATHS.deposit,
        loadComponent: () => import('@/pages/deposit').then((m) => m.DepositPageComponent),
      },
    ],
  },
];
