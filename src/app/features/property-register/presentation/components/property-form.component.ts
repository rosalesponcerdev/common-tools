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
  template: `
    <form (submit)="onSubmit(); $event.preventDefault()" class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tipo de propiedad *
          </label>
          <select
            [formField]="propertyForm.type"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          >
            @for (t of types; track t) {
              <option [value]="t">{{ typeLabels[t] }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Estado *
          </label>
          <select
            [formField]="propertyForm.status"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          >
            @for (s of statuses; track s) {
              <option [value]="s">{{ statusLabels[s] }}</option>
            }
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Área (m²) *
          </label>
          <input
            type="number"
            [formField]="propertyForm.area"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            placeholder="120"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Precio *
          </label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                {{ propertyForm.currency().value() === 'PEN' ? 'S/' : '$' }}
              </span>
              <input
                type="number"
                [formField]="propertyForm.price"
                class="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="450000"
              />
            </div>
            <select
              [formField]="propertyForm.currency"
              class="w-20 px-2 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            >
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      @if (showConstructionYear()) {
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Año de construcción
          </label>
          <input
            type="number"
            [formField]="propertyForm.constructionYear"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            [placeholder]="currentYear.toString()"
          />
        </div>
      }

      <fieldset class="space-y-4">
        <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación</legend>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Distrito *
          </label>
          <input
            type="text"
            [formField]="propertyForm.district"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            placeholder="Miraflores"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Calle *
          </label>
          <input
            type="text"
            [formField]="propertyForm.street"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            placeholder="Av. Larco 1234"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Referencia
          </label>
          <input
            type="text"
            [formField]="propertyForm.reference"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            placeholder="Cerca al parque..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Link Google Maps
          </label>
          <input
            type="url"
            [formField]="propertyForm.mapsUrl"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            placeholder="https://www.google.com/maps/..."
          />
        </div>
      </fieldset>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Descripción
        </label>
        <textarea
          [formField]="propertyForm.description"
          rows="3"
          class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          placeholder="3 dormitorios, 2 baños, facing park..."
        ></textarea>
      </div>

      <button
        type="submit"
        [disabled]="propertyForm().invalid()"
        class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Registrar Propiedad
      </button>
    </form>
  `,
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
