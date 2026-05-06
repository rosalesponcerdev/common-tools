import { Provider } from '@angular/core';
import { CalculateFactoringUseCase } from './application';
import { FactoringCalculatorFacade } from './presentation';

export const providePrestamype = (): Provider[] => {
  return [CalculateFactoringUseCase, FactoringCalculatorFacade];
};
