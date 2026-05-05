import { Injectable } from '@angular/core';
import { Tool, ToolFilter, ToolRepository } from '../domain';
import { TOOLS_DATA } from './tool-data.source';

@Injectable()
export class ToolInMemoryRepository extends ToolRepository {
  private readonly data = TOOLS_DATA;

  async getAll(): Promise<Tool[]> {
    return [...this.data];
  }

  async getById(id: string): Promise<Tool | null> {
    return this.data.find((tool) => tool.id === id) || null;
  }

  async filter(filter: ToolFilter): Promise<Tool[]> {
    const query = filter.searchQuery?.toLowerCase().trim() || '';
    const category = filter.category || 'todas';

    return this.data.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query);

      const matchesCategory = category === 'todas' || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  }
}