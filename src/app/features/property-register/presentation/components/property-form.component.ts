import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormField, form, submit, required, min } from '@angular/forms/signals';
import { CreatePropertyRequest, Currency } from '../../application/dtos/property-request.dto';
import { PropertyType, PROPERTY_TYPES } from '../../domain/property-type.value-object';
import { PropertyStatus, PROPERTY_STATUSES } from '../../domain/property-status.value-object';

interface PropertyFormModel {
  type: PropertyType;
  status: PropertyStatus;
  area: number;
  price: number;
  currency: Currency;
  constructionYear: number;
  district: string;
  street: string;
  reference: string;
  mapsUrl: string;
  description: string;
}

@Component({
  selector: 'app-property-form',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.css',
})
export class PropertyFormComponent {
  readonly property = input<CreatePropertyRequest | null>(null);
  readonly submitForm = output<CreatePropertyRequest>();
  readonly cancel = output<void>();

  readonly types = PROPERTY_TYPES;
  readonly statuses = PROPERTY_STATUSES;

  readonly typeLabels: Record<PropertyType, string> = {
    terreno: 'Terreno',
    casa: 'Casa',
    departamento: 'Departamento',
  };

  readonly statusLabels: Record<PropertyStatus, string> = {
    disponible: 'Disponible',
    apartada: 'Apartada',
    vendida: 'Vendida',
  };

  readonly currentYear = new Date().getFullYear();

  readonly model = signal<PropertyFormModel>({
    type: 'departamento',
    status: 'disponible',
    area: 0,
    price: 0,
    currency: 'PEN',
    constructionYear: 0,
    district: '',
    street: '',
    reference: '',
    mapsUrl: '',
    description: '',
  });

  readonly propertyForm = form(this.model, (s) => {
    required(s.type, { message: 'Selecciona un tipo de propiedad' });
    required(s.status, { message: 'Selecciona un estado' });
    required(s.currency, { message: 'Selecciona una moneda' });
    min(s.area, 1, { message: 'El área debe ser mayor a 0' });
    min(s.price, 1, { message: 'El precio debe ser mayor a 0' });
    required(s.district, { message: 'El distrito es requerido' });
    required(s.street, { message: 'La calle es requerida' });
  });

  readonly showConstructionYear = computed(() => {
    const type = this.propertyForm.type().value();
    return type === 'casa' || type === 'departamento';
  });

  onSubmit() {
    submit(this.propertyForm, async () => {
      const data = this.model();

      const isPen = data.currency === 'PEN';
      const request: CreatePropertyRequest = {
        type: data.type,
        status: data.status,
        area: data.area,
        pricePen: isPen ? data.price : 0,
        priceUsd: isPen ? 0 : data.price,
        currency: data.currency,
        location: {
          district: data.district,
          street: data.street,
          reference: data.reference || '',
          mapsUrl: data.mapsUrl || undefined,
        },
        constructionYear:
          this.showConstructionYear() && data.constructionYear > 0
            ? data.constructionYear
            : undefined,
        description: data.description || '',
      };

      this.submitForm.emit(request);
      this.reset();
    });
  }

  reset() {
    this.model.set({
      type: 'departamento',
      status: 'disponible',
      area: 0,
      price: 0,
      currency: 'PEN',
      constructionYear: 0,
      district: '',
      street: '',
      reference: '',
      mapsUrl: '',
      description: '',
    });
  }
}
