import { UnitOfMeasure, isMassUnit, isVolumeUnit } from './unit-measure.value-object';

export interface Presentation {
  id: string;
  brand: string;
  quantity: number;
  unit: UnitOfMeasure;
  price: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  name: string;
  presentations: Presentation[];
  createdAt: string;
  updatedAt: string;
}

const generateId = (): string => {
  return crypto.randomUUID();
};

export const createProduct = (name: string): Product => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: name.trim(),
    presentations: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const createPresentation = (
  brand: string,
  quantity: number,
  unit: UnitOfMeasure,
  price: number,
): Presentation => {
  return {
    id: generateId(),
    brand: brand.trim(),
    quantity,
    unit,
    price,
    unitPrice: calculateUnitPrice(quantity, unit, price),
  };
};

export const calculateUnitPrice = (
  quantity: number,
  unit: UnitOfMeasure,
  price: number,
): number => {
  if (quantity <= 0 || price <= 0) return 0;

  if (unit === 'kg' || unit === 'lt' || unit === 'unid') {
    return price / quantity;
  }

  if (unit === 'gr') {
    return price / (quantity / 1000);
  }

  if (unit === 'ml') {
    return price / (quantity / 1000);
  }

  return price / quantity;
};

export const getUnitPriceLabel = (unit: UnitOfMeasure): string => {
  if (unit === 'gr') return '/kg';
  if (unit === 'kg') return '/kg';
  if (unit === 'ml') return '/L';
  if (unit === 'lt') return '/L';
  return '/und';
};

export const formatUnitPrice = (unitPrice: number, unit: UnitOfMeasure): string => {
  const label = getUnitPriceLabel(unit);
  return `S/ ${unitPrice.toFixed(2)}${label}`;
};

export const addPresentationToProduct = (product: Product, presentation: Presentation): Product => {
  return {
    ...product,
    presentations: [...product.presentations, presentation],
    updatedAt: new Date().toISOString(),
  };
};

export const updatePresentationInProduct = (
  product: Product,
  presentationId: string,
  updates: Partial<Omit<Presentation, 'id' | 'unitPrice'>>,
): Product => {
  return {
    ...product,
    presentations: product.presentations.map((p) => {
      if (p.id !== presentationId) return p;
      const updated = { ...p, ...updates };
      return {
        ...updated,
        unitPrice: calculateUnitPrice(updated.quantity, updated.unit, updated.price),
      };
    }),
    updatedAt: new Date().toISOString(),
  };
};

export const removePresentationFromProduct = (
  product: Product,
  presentationId: string,
): Product => {
  return {
    ...product,
    presentations: product.presentations.filter((p) => p.id !== presentationId),
    updatedAt: new Date().toISOString(),
  };
};

export const sortPresentationsByUnitPrice = (presentations: Presentation[]): Presentation[] => {
  return [...presentations].sort((a, b) => a.unitPrice - b.unitPrice);
};

export const findCheapestPresentation = (presentations: Presentation[]): Presentation | null => {
  if (presentations.length === 0) return null;
  return sortPresentationsByUnitPrice(presentations)[0];
};

export const filterPresentationsByBrand = (
  presentations: Presentation[],
  brandQuery: string,
): Presentation[] => {
  if (!brandQuery.trim()) return presentations;
  const query = brandQuery.toLowerCase().trim();
  return presentations.filter((p) => p.brand.toLowerCase().includes(query));
};
