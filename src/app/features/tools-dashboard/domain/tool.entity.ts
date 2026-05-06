import { ToolCategory } from './tool-category.value-object';

export interface Tool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: ToolCategory;
  readonly route: string;
}

export function createTool(params: Tool): Tool {
  return Object.freeze({
    id: params.id,
    name: params.name,
    description: params.description,
    icon: params.icon,
    category: params.category,
    route: params.route,
  });
}

export function isToolCategory(value: string): value is ToolCategory {
  return ['finanzas', 'calculadoras', 'conversores', 'utilidades', 'prestamype'].includes(value);
}
