import { Routes } from '@angular/router';
import { provideSmartShopping } from './smart-shopping.providers';

export const SMART_SHOPPING_ROUTES: Routes = [
  {
    path: '',
    providers: provideSmartShopping(),
    loadComponent: () =>
      import('./presentation/smart-shopping.page').then((m) => m.SmartShoppingPageComponent),
  },
];