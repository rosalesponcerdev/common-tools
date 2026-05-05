import { describe, it, expect } from 'vitest';
import {
  calculateUnitPrice,
  createProduct,
  createPresentation,
  addPresentationToProduct,
  updatePresentationInProduct,
  removePresentationFromProduct,
  sortPresentationsByUnitPrice,
  findCheapestPresentation,
  filterPresentationsByBrand,
  formatUnitPrice,
  getUnitPriceLabel,
} from './product.entity';
import type { UnitOfMeasure } from './unit-measure.value-object';

describe('calculateUnitPrice', () => {
  it('debería calcular precio por kg para unidades en kg', () => {
    const result = calculateUnitPrice(1, 'kg', 4.20);
    expect(result).toBe(4.20);
  });

  it('debería normalizar gramos a precio por kg', () => {
    const result = calculateUnitPrice(750, 'gr', 3.50);
    expect(result).toBeCloseTo(4.666, 2);
  });

  it('debería calcular precio por litro para unidades en lt', () => {
    const result = calculateUnitPrice(1, 'lt', 5.00);
    expect(result).toBe(5.00);
  });

  it('debería normalizar ml a precio por litro', () => {
    const result = calculateUnitPrice(500, 'ml', 2.50);
    expect(result).toBeCloseTo(5.00, 2);
  });

  it('debería calcular precio por unidad', () => {
    const result = calculateUnitPrice(12, 'unid', 24.00);
    expect(result).toBe(2.00);
  });

  it('debería retornar 0 para cantidad cero', () => {
    const result = calculateUnitPrice(0, 'kg', 10);
    expect(result).toBe(0);
  });

  it('debería retornar 0 para precio cero', () => {
    const result = calculateUnitPrice(1, 'kg', 0);
    expect(result).toBe(0);
  });

  it('debería retornar 0 para cantidad negativa', () => {
    const result = calculateUnitPrice(-1, 'kg', 10);
    expect(result).toBe(0);
  });
});

describe('createProduct', () => {
  it('debería crear un producto con id generado', () => {
    const product = createProduct('Arroz');
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Arroz');
    expect(product.presentations).toEqual([]);
  });

  it('debería normalizar el nombre trimming espacios', () => {
    const product = createProduct('  Leche  ');
    expect(product.name).toBe('Leche');
  });
});

describe('createPresentation', () => {
  it('debería crear una presentación con unitPrice calculado', () => {
    const presentation = createPresentation('Costeño', 750, 'gr', 3.50);
    expect(presentation.id).toBeDefined();
    expect(presentation.brand).toBe('Costeño');
    expect(presentation.quantity).toBe(750);
    expect(presentation.unit).toBe('gr');
    expect(presentation.price).toBe(3.50);
    expect(presentation.unitPrice).toBeCloseTo(4.666, 2);
  });

  it('debería normalizar la marca trimming espacios', () => {
    const presentation = createPresentation('  Metro  ', 1, 'kg', 4.20);
    expect(presentation.brand).toBe('Metro');
  });
});

describe('addPresentationToProduct', () => {
  it('debería agregar una presentación al producto', () => {
    const product = createProduct('Arroz');
    const presentation = createPresentation('Costeño', 750, 'gr', 3.50);
    const updated = addPresentationToProduct(product, presentation);

    expect(updated.presentations.length).toBe(1);
    expect(updated.presentations[0]).toEqual(presentation);
  });

  it('debería mantener las presentaciones existentes', () => {
    const product = createProduct('Arroz');
    const p1 = createPresentation('Costeño', 750, 'gr', 3.50);
    const p2 = createPresentation('Metro', 1, 'kg', 4.20);

    let updated = addPresentationToProduct(product, p1);
    updated = addPresentationToProduct(updated, p2);

    expect(updated.presentations.length).toBe(2);
  });
});

describe('updatePresentationInProduct', () => {
  it('debería actualizar una presentación existente', () => {
    const product = createProduct('Arroz');
    const presentation = createPresentation('Costeño', 750, 'gr', 3.50);
    const withPresentation = addPresentationToProduct(product, presentation);

    const updated = updatePresentationInProduct(withPresentation, presentation.id, {
      price: 4.00,
    });

    expect(updated.presentations[0].price).toBe(4.00);
    expect(updated.presentations[0].unitPrice).toBeCloseTo(5.333, 2);
  });

  it('debería recalcular unitPrice al cambiar cantidad', () => {
    const product = createProduct('Arroz');
    const presentation = createPresentation('Costeño', 750, 'gr', 3.50);
    const withPresentation = addPresentationToProduct(product, presentation);

    const updated = updatePresentationInProduct(withPresentation, presentation.id, {
      quantity: 1000,
    });

    expect(updated.presentations[0].quantity).toBe(1000);
    expect(updated.presentations[0].unitPrice).toBe(3.50);
  });
});

describe('removePresentationFromProduct', () => {
  it('debería eliminar una presentación', () => {
    const product = createProduct('Arroz');
    const p1 = createPresentation('Costeño', 750, 'gr', 3.50);
    const p2 = createPresentation('Metro', 1, 'kg', 4.20);

    let updated = addPresentationToProduct(product, p1);
    updated = addPresentationToProduct(updated, p2);

    const result = removePresentationFromProduct(updated, p1.id);

    expect(result.presentations.length).toBe(1);
    expect(result.presentations[0].brand).toBe('Metro');
  });
});

describe('sortPresentationsByUnitPrice', () => {
  it('debería ordenar presentaciones de menor a mayor unitPrice', () => {
    const product = createProduct('Arroz');
    const p1 = createPresentation('Marca A', 750, 'gr', 3.50);
    const p2 = createPresentation('Marca B', 1, 'kg', 4.20);
    const p3 = createPresentation('Marca C', 500, 'gr', 2.50);

    const presentations = [p1, p2, p3];
    const sorted = sortPresentationsByUnitPrice(presentations);

    expect(sorted[0].brand).toBe('Marca B');
    expect(sorted[1].brand).toBe('Marca A');
    expect(sorted[2].brand).toBe('Marca C');
  });

  it('no debería mutar el array original', () => {
    const p1 = createPresentation('A', 1, 'kg', 5);
    const p2 = createPresentation('B', 1, 'kg', 3);
    const presentations = [p1, p2];

    sortPresentationsByUnitPrice(presentations);

    expect(presentations[0].brand).toBe('A');
    expect(presentations[1].brand).toBe('B');
  });
});

describe('findCheapestPresentation', () => {
  it('debería retornar la presentación más barata', () => {
    const p1 = createPresentation('A', 750, 'gr', 3.50);
    const p2 = createPresentation('B', 1, 'kg', 4.20);
    const p3 = createPresentation('C', 500, 'gr', 2.50);

    const cheapest = findCheapestPresentation([p1, p2, p3]);

    expect(cheapest?.brand).toBe('B');
  });

  it('debería retornar null para array vacío', () => {
    const result = findCheapestPresentation([]);
    expect(result).toBeNull();
  });
});

describe('filterPresentationsByBrand', () => {
  it('debería filtrar por marca', () => {
    const p1 = createPresentation('Costeño', 750, 'gr', 3.50);
    const p2 = createPresentation('Metro', 1, 'kg', 4.20);
    const p3 = createPresentation('Costeño Premium', 500, 'gr', 5.00);

    const filtered = filterPresentationsByBrand([p1, p2, p3], 'cos');

    expect(filtered.length).toBe(2);
    expect(filtered.map(p => p.brand)).toContain('Costeño');
    expect(filtered.map(p => p.brand)).toContain('Costeño Premium');
  });

  it('debería retornar todas las presentaciones si no hay filtro', () => {
    const p1 = createPresentation('A', 1, 'kg', 3);
    const p2 = createPresentation('B', 1, 'kg', 5);

    const filtered = filterPresentationsByBrand([p1, p2], '');

    expect(filtered.length).toBe(2);
  });

  it('debería ser case insensitive', () => {
    const p1 = createPresentation('COSME', 1, 'kg', 3);

    const filtered = filterPresentationsByBrand([p1], 'cos');

    expect(filtered.length).toBe(1);
  });
});

describe('formatUnitPrice', () => {
  it('debería formatear precio por kg', () => {
    const result = formatUnitPrice(4.20, 'kg');
    expect(result).toBe('S/ 4.20/kg');
  });

  it('debería formatear precio por gr como /kg', () => {
    const result = formatUnitPrice(4.66, 'gr');
    expect(result).toBe('S/ 4.66/kg');
  });

  it('debería formatear precio por lt', () => {
    const result = formatUnitPrice(5.00, 'lt');
    expect(result).toBe('S/ 5.00/L');
  });

  it('debería formatear precio por ml como /L', () => {
    const result = formatUnitPrice(5.00, 'ml');
    expect(result).toBe('S/ 5.00/L');
  });

  it('debería formatear precio por unidad', () => {
    const result = formatUnitPrice(2.00, 'unid');
    expect(result).toBe('S/ 2.00/und');
  });
});

describe('getUnitPriceLabel', () => {
  it('debería retornar /kg para kg y gr', () => {
    expect(getUnitPriceLabel('kg')).toBe('/kg');
    expect(getUnitPriceLabel('gr')).toBe('/kg');
  });

  it('debería retornar /L para lt y ml', () => {
    expect(getUnitPriceLabel('lt')).toBe('/L');
    expect(getUnitPriceLabel('ml')).toBe('/L');
  });

  it('debería retornar /und para unid', () => {
    expect(getUnitPriceLabel('unid')).toBe('/und');
  });
});