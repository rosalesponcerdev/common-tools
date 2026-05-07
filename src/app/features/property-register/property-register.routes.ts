import { Routes } from '@angular/router';
import { providePropertyRegister } from './property-register.providers';

export const PROPERTY_REGISTER_ROUTES: Routes = [
  {
    path: '',
    providers: providePropertyRegister(),
    loadComponent: () =>
      import('./presentation/pages/property-dashboard.page').then((m) => m.PropertyDashboardPage),
  },
];
