import { inject, Injectable } from '@angular/core';
import { Tool, ToolFilter } from '../domain';
import { ToolRepository } from '../domain/tool.repository';

@Injectable()
export class FilterToolsUseCase {
  private readonly repository = inject(ToolRepository);

  async execute(filter: ToolFilter): Promise<Tool[]> {
    return this.repository.filter(filter);
  }
}
