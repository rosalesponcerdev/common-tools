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
  templateUrl: './property-filter.component.html',
  styleUrl: './property-filter.component.css',
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