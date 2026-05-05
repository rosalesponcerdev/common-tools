import { Routes } from '@angular/router';
import { TOOLS_DASHBOARD_ROUTES } from './features/tools-dashboard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => TOOLS_DASHBOARD_ROUTES,
  },
  {
    path: '**',
    redirectTo: '',
  },
];