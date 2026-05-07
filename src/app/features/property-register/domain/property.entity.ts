import { PropertyType, PROPERTY_TYPES } from './property-type.value-object';
import { PropertyStatus, PROPERTY_STATUSES } from './property-status.value-object';
import { Location, LocationProps } from './location.value-object';
import { Currency } from '../application/dtos/property-request.dto';

export type { LocationProps } from './location.value-object';

export interface PropertyProps {
  id: string;
  type: PropertyType;
  area: number;
  pricePen: number;
  priceUsd: number;
  originalCurrency: Currency;
  location: LocationProps;
  constructionYear?: number;
  description: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export class Property {
  private constructor(private readonly props: PropertyProps) {}

  static create(props: Omit<PropertyProps, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const now = new Date().toISOString();
    return new Property({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PropertyProps): Property {
    return new Property(props);
  }

  get id(): string {
    return this.props.id;
  }

  get type(): PropertyType {
    return this.props.type;
  }

  get area(): number {
    return this.props.area;
  }

  get pricePen(): number {
    return this.props.pricePen;
  }

  get priceUsd(): number {
    return this.props.priceUsd;
  }

  get originalCurrency(): Currency {
    return this.props.originalCurrency;
  }

  get location(): Location {
    return Location.reconstitute(this.props.location);
  }

  get locationPlain(): LocationProps {
    return this.props.location;
  }

  get constructionYear(): number | undefined {
    return this.props.constructionYear;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): PropertyStatus {
    return this.props.status;
  }

  get createdAt(): string {
    return this.props.createdAt;
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  get requiresConstructionYear(): boolean {
    return this.props.type === 'casa' || this.props.type === 'departamento';
  }

  calculatePricePerSqmPen(): number {
    return this.props.pricePen / this.props.area;
  }

  changeStatus(newStatus: PropertyStatus): Property {
    return new Property({
      ...this.props,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  updatePrice(newPrice: number): Property {
    if (newPrice <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    return new Property({
      ...this.props,
      pricePen: newPrice,
      updatedAt: new Date().toISOString(),
    });
  }

  toPlain(): PropertyProps {
    return { ...this.props };
  }
}
