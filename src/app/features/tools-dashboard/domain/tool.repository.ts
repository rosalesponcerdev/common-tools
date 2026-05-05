import { Tool } from './tool.entity';
import { ToolCategory } from './tool-category.value-object';

export interface ToolFilter {
  searchQuery?: string;
  category?: ToolCategory | 'todas';
}

export abstract class ToolRepository {
  abstract getAll(): Promise<Tool[]>;
  abstract getById(id: string): Promise<Tool | null>;
  abstract filter(filter: ToolFilter): Promise<Tool[]>;
}