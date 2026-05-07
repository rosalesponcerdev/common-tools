import { Property } from '../domain/property.entity';
import { Location } from '../domain/location.value-object';
import { PropertyType } from '../domain/property-type.value-object';
import { PropertyStatus } from '../domain/property-status.value-object';
import {
  PropertyRequiredFieldError,
  PropertyConstructionYearRequiredError,
  PropertyInvalidPriceError,
  PropertyInvalidAreaError,
} from '../domain/property.errors';
import { CreatePropertyRequest, Currency } from './dtos/property-request.dto';

export class CreatePropertyUseCase {
  execute(request: CreatePropertyRequest): Property {
    this.validate(request);

    const location = Location.create({
      district: request.location.district,
      street: request.location.street,
      reference: request.location.reference || '',
      mapsUrl: request.location.mapsUrl,
      lat: request.location.lat,
      lng: request.location.lng,
    });

    const currency = request.currency || 'PEN';
    const pricePen = currency === 'PEN' ? (request.pricePen || 0) : (request.priceUsd || 0);
    const priceUsd = currency === 'USD' ? (request.priceUsd || 0) : 0;

    return Property.create({
      type: request.type,
      area: request.area,
      pricePen,
      priceUsd,
      originalCurrency: currency,
      location: location.toPlain(),
      constructionYear: request.constructionYear,
      description: request.description || '',
      status: request.status,
    });
  }

  private validate(request: CreatePropertyRequest): void {
    if (!request.type) {
      throw new PropertyRequiredFieldError('tipo');
    }
    if (!request.area || request.area <= 0) {
      throw new PropertyInvalidAreaError();
    }
    
    const hasPrice = request.currency === 'PEN' 
      ? (request.pricePen && request.pricePen > 0)
      : (request.priceUsd && request.priceUsd > 0);
    
    if (!hasPrice) {
      throw new PropertyInvalidPriceError();
    }
    if (!request.location) {
      throw new PropertyRequiredFieldError('ubicación');
    }
    if (!request.location.district) {
      throw new PropertyRequiredFieldError('distrito');
    }
    if (!request.location.street) {
      throw new PropertyRequiredFieldError('calle');
    }

    const requiresYear = request.type === 'casa' || request.type === 'departamento';
    if (requiresYear && !request.constructionYear) {
      throw new PropertyConstructionYearRequiredError();
    }
  }
}