import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '@/shared';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@/pages/home').then((m) => m.HomeComponent),
    children: [
      {
        // To be discussed. This route is not sticky, maybe it would be better to rethink it.
        path: ROUTE_PATHS.deposit,
        loadComponent: () => import('@/pages/deposit').then((m) => m.DepositPageComponent),
      },
    ],
  },
];
