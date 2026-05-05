import { Routes } from '@angular/router';
import { TOOLS_DASHBOARD_ROUTES } from './features/tools-dashboard';
import { PRESTAMYPE_ROUTES } from './features/prestamype';

export const routes: Routes = [
  {
    path: 'tools/prestamype',
    loadChildren: () => PRESTAMYPE_ROUTES,
  },
  {
    path: 'tools',
    loadChildren: () => TOOLS_DASHBOARD_ROUTES,
  },
  {
    path: '',
    redirectTo: 'tools',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'tools',
  },
];
