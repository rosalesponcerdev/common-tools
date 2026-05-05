import { Provider } from '@angular/core';
import { ToolInMemoryRepository } from './infrastructure';
import { FilterToolsUseCase, GetToolByIdUseCase, GetToolsUseCase } from './application';
import { ToolsDashboardFacade } from './presentation';
import { ToolRepository } from './domain';

export const provideTools = (): Provider[] => {
  return [
    {
      provide: ToolRepository,
      useClass: ToolInMemoryRepository,
    },
    GetToolsUseCase,
    FilterToolsUseCase,
    GetToolByIdUseCase,
    ToolsDashboardFacade,
  ];
};
