import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './containers';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
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
        path: 'content',
        loadChildren: () =>
          import('./views/content/content.module').then((m) => m.ContentModule),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
