# HU03 — Registro y Comparación de Propiedades Inmobiliarias

## 1. Historia de Usuario (HU)

**Título:** Registro y Comparación de Propiedades Inmobiliarias

**Como:** Inversor inmobiliario
**Quiero:** Registrar propiedades (terrenos, casas, departamentos) con su información completa y ubicación
**Para:** Comparar precios por metro cuadrado, filtrar por ubicación/tipo/precio y tomar decisiones informadas de inversión

### Criterios de Aceptación:

1.  **Registro de Propiedades:** Permitir crear propiedades con:
    - Tipo (terreno/casa/departamento)
    - Área (m²)
    - Precio en soles (PEN)
    - Ubicación completa (distrito, calle, referencia, link Google Maps, coordenadas opcionales)
    - Año de construcción (obligatorio para casa/departamento, opcional para terreno)
    - Descripción libre (número de baños, dormitorios, características)
    - Estado (disponible/apartada/vendida)
    - Fecha de registro automática

2.  **Cálculo Automático:** Calcular y mostrar en tiempo real:
    - Precio en USD (convertido con tipo de cambio)
    - Precio por metro cuadrado en USD
    - Tipo de cambio editable desde configuración

3.  **Filtros Reactivos:** Filtrar por:
    - Tipo de propiedad
    - Rango de precio (USD)
    - Rango de área (m²)
    - Año de construcción
    - Distrito/ubicación
    - Estado (disponible/apartada/vendida)

4.  **Ordenamiento:** Ordenar por:
    - Precio por m² (menor a mayor)
    - Precio total (USD)
    - Área
    - Fecha de registro

5.  **Visualización:**
    - Card por propiedad con datos clave
    - Mapa embebido (iframe Google Maps)
    - Badge de estado
    - Información de moneda dual (PEN original + USD convertido)

6.  **Persistencia:** Usar localStorage para guardar propiedades y tipo de cambio

---

## 2. Especificación Técnica

### Stack Tecnológico

- **Framework:** Angular 21+ (standalone components, signals, zoneless)
- **Estilos:** Tailwind CSS 4.1+
- **Testing:** Vitest
- **Persistencia:** localStorage
- **Maps:** iframe embebido Google Maps

### Estructura de Proyecto (Arquitectura Hexagonal)

```
features/property-register/
├── domain/
│   ├── property.entity.ts           # Entidad con lógica de negocio
│   ├── property-type.value-object.ts
│   ├── location.value-object.ts
│   ├── property-status.value-object.ts
│   ├── property.repository.ts     # Puerto (abstract class)
│   └── property.errors.ts        # Errores tipados
├── application/
│   ├── dtos/
│   │   ├── property-request.dto.ts
│   │   └── property-response.dto.ts
│   ├── create-property.use-case.ts
│   ├── update-property.use-case.ts
│   ├── delete-property.use-case.ts
│   ├── get-properties.use-case.ts
│   ├── filter-properties.use-case.ts
│   └── update-exchange-rate.use-case.ts
├── infrastructure/
│   ├── property-local-storage.repository.ts
│   └── exchange-rate-storage.ts
├── presentation/
│   ├── components/
│   │   ├── property-form.component.ts
│   │   ├── property-card.component.ts
│   │   ├── property-list.component.ts
│   │   ├── property-filter.component.ts
│   │   └── exchange-rate-settings.component.ts
│   ├── pages/
│   │   └── property-dashboard.page.ts
│   ├── facades/
│   │   └── property-register.facade.ts
│   └── property-register.routes.ts
└── property-register.providers.ts
```

---

## 3. Modelo de Datos

### Interfaces de Dominio

```typescript
// domain/property-type.value-object.ts
export type PropertyType = 'terreno' | 'casa' | 'departamento';

export const PROPERTY_TYPES: PropertyType[] = ['terreno', 'casa', 'departamento'];
```

```typescript
// domain/property-status.value-object.ts
export type PropertyStatus = 'disponible' | 'apartada' | 'vendida';

export const PROPERTY_STATUSES: PropertyStatus[] = ['disponible', 'apartada', 'vendida'];
```

```typescript
// domain/location.value-object.ts
export interface Location {
  district: string;
  street: string;
  reference: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
}
```

```typescript
// domain/property.entity.ts
import { PropertyType } from './property-type.value-object';
import { PropertyStatus } from './property-status.value-object';
import { Location } from './location.value-object';

export interface Property {
  id: string;
  type: PropertyType;
  area: number;
  pricePen: number;
  location: Location;
  constructionYear?: number;
  description: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyCalculated {
  priceUsd: number;
  pricePerSqmUsd: number;
  isNew: boolean;
}
```

```typescript
// domain/property.repository.ts
import { Property } from './property.entity';

export abstract class PropertyRepository {
  abstract getAll(): Property[];
  abstract getById(id: string): Property | null;
  abstract save(property: Property): void;
  abstract update(property: Property): void;
  abstract delete(id: string): void;
}
```

```typescript
// domain/property.errors.ts
export class PropertyErrors {
  static readonly REQUIRED = 'El campo {field} es requerido';
  static readonly INVALID_AREA = 'El área debe ser mayor a 0';
  static readonly INVALID_PRICE = 'El precio debe ser mayor a 0';
  static readonly INVALID_YEAR = 'El año de construcción es requerido para casas y departamentos';
  static readonly NOT_FOUND = 'Propiedad no encontrada';
}
```

---

## 4. Casos de Uso

### DTOs

```typescript
// application/dtos/property-request.dto.ts
import { PropertyType } from '../../domain/property-type.value-object';
import { PropertyStatus } from '../../domain/property-status.value-object';
import { Location } from '../../domain/location.value-object';

export interface CreatePropertyRequest {
  type: PropertyType;
  area: number;
  pricePen: number;
  location: Location;
  constructionYear?: number;
  description: string;
  status: PropertyStatus;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  id: string;
}
```

```typescript
// application/dtos/property-response.dto.ts
import { Property, PropertyCalculated } from '../../domain/property.entity';

export interface PropertyResponse extends Property, PropertyCalculated {}
```

### CreatePropertyUseCase

```typescript
// application/create-property.use-case.ts
export class CreatePropertyUseCase {
  execute(request: CreatePropertyRequest): Property {
    const property: Property = {
      id: crypto.randomUUID(),
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return property;
  }
}
```

### FilterPropertiesUseCase

```typescript
// application/filter-properties.use-case.ts
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
  sortBy?: 'pricePerSqm' | 'priceTotal' | 'area' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class FilterPropertiesUseCase {
  execute(properties: Property[], filter: PropertyFilter): Property[] {
    let filtered = [...properties];
    
    if (filter.type) {
      filtered = filtered.filter(p => p.type === filter.type);
    }
    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(p => p.pricePen >= filter.minPrice!);
    }
    // ... más filtros
    
    // Ordenamiento
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.sortOrder === 'desc' ? -1 : 1;
        // Implementar lógica de ordenamiento
        return 0;
      });
    }
    
    return filtered;
  }
}
```

---

## 5. Persistencia

### localStorage Keys

```typescript
// infrastructure/property-local-storage.repository.ts
const PROPERTIES_KEY = 'property_register_properties';
const EXCHANGE_RATE_KEY = 'property_register_exchange_rate';

const DEFAULT_EXCHANGE_RATE = {
  value: 3.70,
  updatedAt: new Date().toISOString(),
};
```

---

## 6. Facade (State Management)

```typescript
// presentation/facades/property-register.facade.ts
@injectable()
export class PropertyRegisterFacade {
  private readonly propertyRepo = inject(PropertyRepository);
  private readonly exchangeRateStorage = inject(ExchangeRateStorage);

  readonly properties = signal<Property[]>([]);
  readonly exchangeRate = signal<ExchangeRate>(DEFAULT_EXCHANGE_RATE);
  readonly filter = signal<PropertyFilter>({});
  readonly isLoading = signal(false);

  readonly filteredProperties = computed(() => {
    const filterPropertiesUseCase = new FilterPropertiesUseCase();
    return filterPropertiesUseCase.execute(this.properties(), this.filter());
  });

  readonly propertiesWithCalculated = computed(() => {
    const rate = this.exchangeRate().value;
    return this.filteredProperties().map(p => ({
      ...p,
      priceUsd: p.pricePen / rate,
      pricePerSqmUsd: (p.pricePen / rate) / p.area,
      isNew: p.constructionYear ? p.constructionYear >= new Date().getFullYear() - 2 : false,
    }));
  });

  createProperty(request: CreatePropertyRequest): void {
    const useCase = new CreatePropertyUseCase();
    const property = useCase.execute(request);
    this.propertyRepo.save(property);
    this.properties.update(list => [...list, property]);
  }

  updateFilter(filter: Partial<PropertyFilter>): void {
    this.filter.update(current => ({ ...current, ...filter }));
  }

  updateExchangeRate(value: number): void {
    const newRate: ExchangeRate = {
      value,
      updatedAt: new Date().toISOString(),
    };
    this.exchangeRateStorage.save(newRate);
    this.exchangeRate.set(newRate);
  }
}
```

---

## 7. Componentes UI

### PropertyDashboardPage

```typescript
@Component({
  selector: 'app-property-dashboard',
  template: `
    <div class="p-4 max-w-7xl mx-auto">
      <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Registro de Propiedades</h1>
        <app-exchange-rate-settings />
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside class="lg:col-span-1">
          <app-property-filter />
        </aside>
        <main class="lg:col-span-3">
          <app-property-list />
        </main>
      </div>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDashboardPage {}
```

### PropertyCardComponent

```typescript
@Component({
  selector: 'app-property-card',
  template: `
    <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      @if (property.location.mapsUrl) {
        <div class="h-48 overflow-hidden">
          <iframe
            [src]="property.location.mapsUrl"
            class="w-full h-full border-0"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      }
      <div class="p-4">
        <div class="flex justify-between items-start mb-2">
          <span class="px-2 py-1 text-xs font-semibold rounded"
            [class]="statusClass">
            {{ property.status }}
          </span>
          <span class="text-sm text-gray-500">{{ property.type }}</span>
        </div>
        
        <h3 class="font-semibold mb-1">
          {{ property.location.district }}
        </h3>
        <p class="text-sm text-gray-600 mb-2">
          {{ property.location.street }}
        </p>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Área</span>
            <p class="font-medium">{{ property.area }} m²</p>
          </div>
          <div>
            <span class="text-gray-500">Precio/m²</span>
            <p class="font-medium text-green-600">
              \${{ calculated.pricePerSqmUsd | number:'1.2-2' }}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t">
          <p class="text-lg font-bold">
            \${{ calculated.priceUsd | number:'1.2-2' }}
            <span class="text-sm font-normal text-gray-500">
              (S/ {{ property.pricePen | number:'1.2-2' }})
            </span>
          </p>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyCardComponent {
  readonly property = input.required<Property & PropertyCalculated>();
  
  get statusClass() {
    switch (this.property().status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'apartada': return 'bg-yellow-100 text-yellow-800';
      case 'vendida': return 'bg-gray-100 text-gray-800';
    }
  }
}
```

### PropertyFormComponent (Signal Forms)

```typescript
@Component({
  selector: 'app-property-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="type">Tipo de propiedad</label>
        <select formControlName="type" id="type" class="form-input">
          @for (type of propertyTypes; track type) {
            <option [value]="type">{{ type }}</option>
          }
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="area">Área (m²)</label>
          <input type="number" formControlName="area" id="area" class="form-input" />
        </div>
        <div>
          <label for="pricePen">Precio (PEN)</label>
          <input type="number" formControlName="pricePen" id="pricePen" class="form-input" />
        </div>
      </div>

      @if (showConstructionYear()) {
        <div>
          <label for="constructionYear">Año de construcción</label>
          <input type="number" formControlName="constructionYear" id="constructionYear" class="form-input" />
        </div>
      }

      <fieldset formGroupName="location">
        <legend class="text-lg font-medium mb-2">Ubicación</legend>
        <div class="space-y-4">
          <div>
            <label for="district">Distrito</label>
            <input type="text" formControlName="district" id="district" class="form-input" />
          </div>
          <div>
            <label for="street">Calle</label>
            <input type="text" formControlName="street" id="street" class="form-input" />
          </div>
          <div>
            <label for="reference">Referencia</label>
            <input type="text" formControlName="reference" id="reference" class="form-input" />
          </div>
          <div>
            <label for="mapsUrl">Link Google Maps</label>
            <input type="url" formControlName="mapsUrl" id="mapsUrl" class="form-input" />
          </div>
        </div>
      </fieldset>

      <div>
        <label for="description">Descripción</label>
        <textarea formControlName="description" id="description" class="form-input" rows="3"></textarea>
      </div>

      <div>
        <label for="status">Estado</label>
        <select formControlName="status" id="status" class="form-input">
          @for (status of propertyStatuses; track status) {
            <option [value]="status">{{ status }}</option>
          }
        </select>
      </div>

      <button type="submit" [disabled]="form.invalid" class="btn-primary">
        Registrar Propiedad
      </button>
    </form>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
  readonly propertyTypes = PROPERTY_TYPES;
  readonly propertyStatuses = PROPERTY_STATUSES;

  readonly form = new FormGroup({
    type: new FormControl('', Validators.required),
    area: new FormControl(0, [Validators.required, Validators.min(1)]),
    pricePen: new FormControl(0, [Validators.required, Validators.min(1)]),
    constructionYear: new FormControl<number | null>(null),
    location: new FormGroup({
      district: new FormControl('', Validators.required),
      street: new FormControl('', Validators.required),
      reference: new FormControl(''),
      mapsUrl: new FormControl(''),
    }),
    description: new FormControl(''),
    status: new FormControl('disponible', Validators.required),
  });

  readonly showConstructionYear = computed(() => {
    const type = this.form.get('type')?.value;
    return type === 'casa' || type === 'departamento';
  });

  readonly submit = output<CreatePropertyRequest>();

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value;
      this.submit.emit({
        type: value.type!,
        area: value.area!,
        pricePen: value.pricePen!,
        location: value.location!,
        constructionYear: value.constructionYear ?? undefined,
        description: value.description ?? '',
        status: value.status!,
      });
    }
  }
}
```

---

## 8. Estilos (Tailwind CSS)

```css
/* styles.css */
@theme {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent;
}

.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
```

---

## 9. Rutas

```typescript
// property-register.routes.ts
import { Routes } from '@angular/router';
import { providePropertyRegister } from './property-register.providers';

export const PROPERTY_REGISTER_ROUTES: Routes = [
  {
    path: '',
    providers: [providePropertyRegister()],
    loadComponent: () =>
      import('./presentation/pages/property-dashboard.page').then(
        (m) => m.PropertyDashboardPage
      ),
  },
];
```

---

## 10. Providers

```typescript
// property-register.providers.ts
import { Provider } from '@angular/core';
import { PropertyLocalStorageRepository } from './infrastructure/property-local-storage.repository';
import { PropertyRepository } from './domain/property.repository';
import { CreatePropertyUseCase } from './application/create-property.use-case';
import { UpdatePropertyUseCase } from './application/update-property.use-case';
import { DeletePropertyUseCase } from './application/delete-property.use-case';
import { GetPropertiesUseCase } from './application/get-properties.use-case';
import { FilterPropertiesUseCase } from './application/filter-properties.use-case';
import { PropertyRegisterFacade } from './presentation/facades/property-register.facade';

export const providePropertyRegister = (): Provider[] => {
  return [
    PropertyRepository,
    { provide: PropertyRepository, useClass: PropertyLocalStorageRepository },
    CreatePropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
    GetPropertiesUseCase,
    FilterPropertiesUseCase,
    PropertyRegisterFacade,
  ];
};
```

---

## 11. Ejemplo de Uso

### Registrar una propiedad

1. El usuario completa el formulario con:
   - Tipo: "departamento"
   - Área: 120 m²
   - Precio: S/ 450,000
   - Distrito: "Miraflores"
   - Calle: "Av. Larco 1200"
   - Referencia: "Cerca al parque de la Inversión"
   - Link Maps: "https://www.google.com/maps/..."
   - Año construcción: 2019
   - Descripción: "3 dormitorios, 2 baños, facing park"
   - Estado: "disponible"

2. El sistema calcula automáticamente:
   - Precio USD: $121,622 (450,000 / 3.70)
   - Precio/m² USD: $1,013

3. Al filtrar por "distrito: Miraflores", aparecen las propiedades de ese distrito ordenadas por precio/m²

### Flujo de usuario

```
1. Dashboard muestra lista de propiedades
2. Sidebar permite filtrar por tipo, precio, área, año, distrito, estado
3. Click en "Añadir Propiedad" abre modal/formulario
4. Al guardar, la lista se actualiza automáticamente (signals)
5. Cada card muestra mapa embebido, precio PEN/USD, precio/m²
6. Settings permite cambiar tipo de cambio global
```

---

## 12. Validaciones

| Campo | Validación |
|-------|------------|
| Tipo | Obligatorio, uno de: terreno/casa/departamento |
| Área | Obligatorio, > 0 |
| Precio PEN | Obligatorio, > 0 |
| Distrito | Obligatorio |
| Calle | Obligatorio |
| Año construcción | Obligatorio si tipo=casa o tipo=departamento |
| Estado | Obligatorio, uno de: disponible/apartada/vendida |
| Link Maps | Opcional, URL válida |