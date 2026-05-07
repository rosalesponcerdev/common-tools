import { PropertyType } from '../../domain/property-type.value-object';
import { PropertyStatus } from '../../domain/property-status.value-object';
import { Currency } from './property-request.dto';

export interface LocationResponse {
  district: string;
  street: string;
  reference: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
}

export interface PropertyResponse {
  id: string;
  type: PropertyType;
  area: number;
  pricePen: number;
  priceUsd: number;
  originalCurrency: Currency;
  location: LocationResponse;
  constructionYear?: number;
  description: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  pricePerSqmUsd: number;
  isNew: boolean;
}