import { PropertyType, PROPERTY_TYPES } from '../../domain/property-type.value-object';
import { PropertyStatus, PROPERTY_STATUSES } from '../../domain/property-status.value-object';

export type Currency = 'PEN' | 'USD';

export interface LocationRequest {
  district: string;
  street: string;
  reference: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
}

export interface CreatePropertyRequest {
  type: PropertyType;
  area: number;
  pricePen: number;
  priceUsd?: number;
  currency: Currency;
  location: LocationRequest;
  constructionYear?: number;
  description: string;
  status: PropertyStatus;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  id: string;
}