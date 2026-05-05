import { Provider } from '@angular/core';
import { ProductLocalStorageRepository } from './infrastructure';
import { GetProductsUseCase, CreateProductUseCase, AddPresentationUseCase, UpdatePresentationUseCase, DeleteProductUseCase, DeletePresentationUseCase } from './application';
import { SmartShoppingFacade } from './presentation';
import { ProductRepository } from './domain';

export const provideSmartShopping = (): Provider[] => {
  return [
    { provide: ProductRepository, useClass: ProductLocalStorageRepository },
    GetProductsUseCase,
    CreateProductUseCase,
    AddPresentationUseCase,
    UpdatePresentationUseCase,
    DeleteProductUseCase,
    DeletePresentationUseCase,
    SmartShoppingFacade,
  ];
};