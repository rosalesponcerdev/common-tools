import { Routes } from '@angular/router';
import { providePrestamype } from './prestamype.providers';

export const PRESTAMYPE_ROUTES: Routes = [
  {
    path: 'factoring',
    providers: providePrestamype(),
    loadComponent: () =>
      import('./presentation/pages/factoring-calculator.page').then(
        (m) => m.FactoringCalculatorPage,
      ),
  },
];
