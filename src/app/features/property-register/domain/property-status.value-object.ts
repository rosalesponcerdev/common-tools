export type PropertyStatus = 'disponible' | 'apartada' | 'vendida';

export const PROPERTY_STATUSES: PropertyStatus[] = ['disponible', 'apartada', 'vendida'];

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: 'Disponible',
  apartada: 'Apartada',
  vendida: 'Vendida',
};

export function isPropertyStatus(value: string): value is PropertyStatus {
  return PROPERTY_STATUSES.includes(value as PropertyStatus);
}