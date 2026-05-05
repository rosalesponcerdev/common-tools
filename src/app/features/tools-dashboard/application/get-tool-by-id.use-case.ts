import { inject, Injectable } from '@angular/core';
import { Tool, ToolNotFoundError } from '../domain';
import { ToolRepository } from '../domain/tool.repository';

@Injectable()
export class GetToolByIdUseCase {
  private readonly repository = inject(ToolRepository);

  async execute(id: string): Promise<Tool> {
    const tool = await this.repository.getById(id);
    if (!tool) {
      throw new ToolNotFoundError(id);
    }
    return tool;
  }
}
