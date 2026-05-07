import { Provider } from '@angular/core';
import { PropertyLocalStorageRepository } from './infrastructure/property-local-storage.repository';
import { ExchangeRateStorage } from './infrastructure/exchange-rate.storage';
import { PropertyRepository } from './domain/property.repository';
import { PropertyRegisterFacade } from './presentation/property-register.facade';

export const providePropertyRegister = (): Provider[] => {
  return [
    { provide: PropertyRepository, useClass: PropertyLocalStorageRepository },
    PropertyLocalStorageRepository,
    ExchangeRateStorage,
    PropertyRegisterFacade,
  ];
};
