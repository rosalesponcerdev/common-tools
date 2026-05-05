export type ToolCategory = 'finanzas' | 'calculadoras' | 'conversores' | 'utilidades' | 'prestamype';

export const TOOL_CATEGORIES: { value: ToolCategory | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'calculadoras', label: 'Calculadoras' },
  { value: 'conversores', label: 'Conversores' },
  { value: 'utilidades', label: 'Utilidades' },
  { value: 'prestamype', label: 'Prestamype' },
];