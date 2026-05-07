import { Property } from '../domain/property.entity';
import { PropertyResponse } from './dtos/property-response.dto';

export class CalculatePropertyMetricsUseCase {
  execute(property: Property, exchangeRate: number): PropertyResponse {
    const originalCurrency = property.originalCurrency;
    
    let pricePen: number;
    let priceUsd: number;
    
    if (originalCurrency === 'PEN') {
      pricePen = property.pricePen || 0;
      priceUsd = property.pricePen ? property.pricePen / exchangeRate : 0;
    } else {
      pricePen = property.priceUsd ? property.priceUsd * exchangeRate : 0;
      priceUsd = property.priceUsd || 0;
    }
    
    const pricePerSqmUsd = priceUsd / property.area;

    const currentYear = new Date().getFullYear();
    const isNew =
      property.constructionYear !== undefined &&
      property.constructionYear >= currentYear - 2;

    return {
      id: property.id,
      type: property.type,
      area: property.area,
      pricePen,
      priceUsd,
      originalCurrency,
      location: property.locationPlain,
      constructionYear: property.constructionYear,
      description: property.description,
      status: property.status,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      pricePerSqmUsd,
      isNew,
    };
  }

  executeMany(
    properties: Property[],
    exchangeRate: number
  ): PropertyResponse[] {
    return properties.map((p) => this.execute(p, exchangeRate));
  }
}