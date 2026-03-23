import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/default-layout/default-layout.component').then(
        (m) => m.DefaultLayoutComponent,
      ),
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then(
            (m) => m.DashboardModule,
          ),
      },
      {
        path: 'system',
        loadChildren: () =>
          import('./views/system/system.module').then((m) => m.SystemModule),
      },
      {
        path: 'audit-logs',
        loadChildren: () =>
          import('./views/audit-logs/audit-logs.module').then(
            (m) => m.AuditLogsModule,
          ),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./views/payments/payments.module').then(
            (m) => m.PaymentsModule,
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./views/products/products.module').then(
            (m) => m.ProductsModule,
          ),
      },
      {
        path: 'sellers',
        loadChildren: () =>
          import('./views/sellers/sellers.module').then((m) => m.SellersModule),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
