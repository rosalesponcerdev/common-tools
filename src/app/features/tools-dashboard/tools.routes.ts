import { Routes } from '@angular/router';
import { provideTools } from './tools.providers';
import { PRESTAMYPE_ROUTES } from '../prestamype';

export const TOOLS_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: provideTools(),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/tools-dashboard.page').then((m) => m.ToolsDashboardPage),
      },
      {
        path: 'prestamype',
        loadChildren: () => PRESTAMYPE_ROUTES,
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./presentation/pages/tool-placeholder.page').then((m) => m.ToolPlaceholderPage),
      },
    ],
  },
];
