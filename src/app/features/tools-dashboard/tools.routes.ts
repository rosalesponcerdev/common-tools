import { Routes } from '@angular/router';
import { provideTools } from './tools.providers';

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
        path: ':id',
        loadComponent: () =>
          import('./presentation/pages/tool-placeholder.page').then((m) => m.ToolPlaceholderPage),
      },
    ],
  },
];
