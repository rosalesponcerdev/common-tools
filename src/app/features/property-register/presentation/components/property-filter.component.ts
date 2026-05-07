import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { PropertyFilter } from '../../application/filter-properties.use-case';
import { PROPERTY_TYPES, PropertyType } from '../../domain/property-type.value-object';
import { PROPERTY_STATUSES, PropertyStatus } from '../../domain/property-status.value-object';

interface FilterFormModel {
  type: string;
  status: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  yearFrom: number;
  yearTo: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-property-filter',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-app-surface dark:bg-app-dark-surface rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-gray-900 dark:text-white">Filtros</h2>
        <button
          type="button"
          (click)="onClear()"
          class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Limpiar
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
          >
            Tipo
          </label>
          <select
            [formField]="filterForm.type"
            (change)="onFieldChange()"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          >
            <option value="">Todos</option>
            @for (type of types; track type) {
              <option [value]="type">{{ typeLabels[type] }}</option>
            }
          </select>
        </div>

        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
          >
            Estado
          </label>
          <select
            [formField]="filterForm.status"
            (change)="onFieldChange()"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          >
            <option value="">Todos</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ statusLabels[status] }}</option>
            }
          </select>
        </div>

        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
          >
            Distrito
          </label>
          <input
            type="text"
            [formField]="filterForm.district"
            (blur)="onFieldChange()"
            placeholder="Buscar distrito..."
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
            >
              Precio min
            </label>
            <input
              type="number"
              [formField]="filterForm.minPrice"
              (blur)="onFieldChange()"
              placeholder="0"
              class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
            >
              Precio max
            </label>
            <input
              type="number"
              [formField]="filterForm.maxPrice"
              (blur)="onFieldChange()"
              placeholder="999999"
              class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
            >
              Área min (m²)
            </label>
            <input
              type="number"
              [formField]="filterForm.minArea"
              (blur)="onFieldChange()"
              placeholder="0"
              class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
            >
              Área max (m²)
            </label>
            <input
              type="number"
              [formField]="filterForm.maxArea"
              (blur)="onFieldChange()"
              placeholder="99999"
              class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
            >
              Año desde
            </label>
            <input
              type="number"
              [formField]="filterForm.yearFrom"
              (blur)="onFieldChange()"
              placeholder="2000"
              class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
            >
              Año hasta
            </label>
            <input
              type="number"
              [formField]="filterForm.yearTo"
              (blur)="onFieldChange()"
              placeholder="2030"
              class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
          >
            Ordenar por
          </label>
          <div class="flex gap-2">
            <select
              [formField]="filterForm.sortBy"
              (change)="onFieldChange()"
              class="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            >
              <option value="createdAt">Fecha</option>
              <option value="pricePerSqm">Precio/m²</option>
              <option value="priceTotal">Precio total</option>
              <option value="area">Área</option>
            </select>
            <button
              type="button"
              (click)="toggleSortOrder()"
              class="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              [title]="filterForm.sortOrder().value() === 'asc' ? 'Ascendente' : 'Descendente'"
            >
              @if (filterForm.sortOrder().value() === 'asc') {
                ↑
              } @else {
                ↓
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PropertyFilterComponent {
  readonly filter = input.required<PropertyFilter>();
  readonly updateFilter = output<Partial<PropertyFilter>>();
  readonly clearFilter = output<void>();

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

  readonly model = signal<FilterFormModel>({
    type: '',
    status: '',
    district: '',
    minPrice: 0,
    maxPrice: 0,
    minArea: 0,
    maxArea: 0,
    yearFrom: 0,
    yearTo: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  readonly filterForm = form(this.model, (s) => {
    // No validation needed for filters
  });

  constructor() {
    // Sync from external filter when it changes
    effect(() => {
      const ext = this.filter();
      this.syncFromExternal(ext);
    });
  }

  private syncFromExternal(ext: PropertyFilter) {
    // Only update if different to avoid loops
    const current = this.model();
    const newValues: FilterFormModel = {
      type: ext.type || '',
      status: ext.status || '',
      district: ext.district || '',
      minPrice: ext.minPrice || 0,
      maxPrice: ext.maxPrice || 0,
      minArea: ext.minArea || 0,
      maxArea: ext.maxArea || 0,
      yearFrom: ext.yearFrom || 0,
      yearTo: ext.yearTo || 0,
      sortBy: ext.sortBy || 'createdAt',
      sortOrder: ext.sortOrder || 'desc',
    };
    
    // Check if different
    if (JSON.stringify(current) !== JSON.stringify(newValues)) {
      this.model.set(newValues);
    }
  }

  onFieldChange() {
    this.emitFilterUpdate();
  }

  onClear() {
    this.model.set({
      type: '',
      status: '',
      district: '',
      minPrice: 0,
      maxPrice: 0,
      minArea: 0,
      maxArea: 0,
      yearFrom: 0,
      yearTo: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    this.clearFilter.emit();
  }

  toggleSortOrder() {
    const current = this.filterForm.sortOrder().value();
    const newOrder = current === 'asc' ? 'desc' : 'asc';
    this.model.update((m) => ({ ...m, sortOrder: newOrder }));
    this.emitFilterUpdate();
  }

  private emitFilterUpdate() {
    const m = this.model();
    this.updateFilter.emit({
      type: (m.type as PropertyType) || undefined,
      status: (m.status as PropertyStatus) || undefined,
      district: m.district || undefined,
      minPrice: m.minPrice || undefined,
      maxPrice: m.maxPrice || undefined,
      minArea: m.minArea || undefined,
      maxArea: m.maxArea || undefined,
      yearFrom: m.yearFrom || undefined,
      yearTo: m.yearTo || undefined,
      sortBy: m.sortBy as any,
      sortOrder: m.sortOrder,
    });
  }
}