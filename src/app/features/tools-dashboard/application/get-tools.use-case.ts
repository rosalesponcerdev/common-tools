import { inject, Injectable } from '@angular/core';
import { Tool } from '../domain';
import { ToolRepository } from '../domain/tool.repository';

@Injectable()
export class GetToolsUseCase {
  private readonly repository = inject(ToolRepository);

  async execute(): Promise<Tool[]> {
    return this.repository.getAll();
  }
}
