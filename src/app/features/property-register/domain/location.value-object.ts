export interface LocationProps {
  district: string;
  street: string;
  reference: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
}

export class Location {
  private constructor(private readonly props: LocationProps) {}

  static create(props: LocationProps): Location {
    if (!props.district.trim()) {
      throw new Error('El distrito es requerido');
    }
    if (!props.street.trim()) {
      throw new Error('La calle es requerida');
    }
    return new Location(props);
  }

  static reconstitute(props: LocationProps): Location {
    return new Location(props);
  }

  get district(): string {
    return this.props.district;
  }

  get street(): string {
    return this.props.street;
  }

  get reference(): string {
    return this.props.reference;
  }

  get mapsUrl(): string | undefined {
    return this.props.mapsUrl;
  }

  get lat(): number | undefined {
    return this.props.lat;
  }

  get lng(): number | undefined {
    return this.props.lng;
  }

  get fullAddress(): string {
    return `${this.props.street}, ${this.props.district}${this.props.reference ? `, ${this.props.reference}` : ''}`;
  }

  equals(other: Location): boolean {
    return this.props.district === other.props.district && this.props.street === other.props.street;
  }

  toPlain(): LocationProps {
    return { ...this.props };
  }
}
