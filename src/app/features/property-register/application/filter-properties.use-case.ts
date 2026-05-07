import { Property } from '../domain/property.entity';
import { PropertyType } from '../domain/property-type.value-object';
import { PropertyStatus } from '../domain/property-status.value-object';

export type SortBy = 'pricePerSqm' | 'priceTotal' | 'area' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface PropertyFilter {
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  yearFrom?: number;
  yearTo?: number;
  district?: string;
  status?: PropertyStatus;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export const DEFAULT_FILTER: PropertyFilter = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export class FilterPropertiesUseCase {
  execute(properties: Property[], filter: PropertyFilter, exchangeRate: number): Property[] {
    let filtered = [...properties];

    if (filter.type) {
      filtered = filtered.filter((p) => p.type === filter.type);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.pricePen / exchangeRate >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.pricePen / exchangeRate <= filter.maxPrice!);
    }

    if (filter.minArea !== undefined) {
      filtered = filtered.filter((p) => p.area >= filter.minArea!);
    }

    if (filter.maxArea !== undefined) {
      filtered = filtered.filter((p) => p.area <= filter.maxArea!);
    }

    if (filter.yearFrom !== undefined) {
      filtered = filtered.filter(
        (p) => p.constructionYear && p.constructionYear >= filter.yearFrom!,
      );
    }

    if (filter.yearTo !== undefined) {
      filtered = filtered.filter((p) => p.constructionYear && p.constructionYear <= filter.yearTo!);
    }

    if (filter.district) {
      const districtLower = filter.district.toLowerCase();
      filtered = filtered.filter((p) => p.location.district.toLowerCase().includes(districtLower));
    }

    if (filter.status) {
      filtered = filtered.filter((p) => p.status === filter.status);
    }

    if (filter.sortBy) {
      const order = filter.sortOrder === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
        switch (filter.sortBy) {
          case 'pricePerSqm':
            const aPricePerSqm = a.pricePen / a.area;
            const bPricePerSqm = b.pricePen / b.area;
            return (aPricePerSqm - bPricePerSqm) * order;
          case 'priceTotal':
            return (a.pricePen - b.pricePen) * order;
          case 'area':
            return (a.area - b.area) * order;
          case 'createdAt':
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }
}
