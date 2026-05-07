export type PropertyType = 'terreno' | 'casa' | 'departamento';

export const PROPERTY_TYPES: PropertyType[] = ['terreno', 'casa', 'departamento'];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  terreno: 'Terreno',
  casa: 'Casa',
  departamento: 'Departamento',
};

export function getPropertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type];
}

export function isPropertyType(value: string): value is PropertyType {
  return PROPERTY_TYPES.includes(value as PropertyType);
}
