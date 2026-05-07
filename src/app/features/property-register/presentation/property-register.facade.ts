import { Injectable, inject, signal, computed } from '@angular/core';
import { Property } from '../domain/property.entity';
import { PropertyRepository } from '../domain/property.repository';
import { PropertyResponse } from '../application/dtos/property-response.dto';
import {
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from '../application/dtos/property-request.dto';
import { PropertyFilter, DEFAULT_FILTER, SortBy, SortOrder } from '../application/filter-properties.use-case';
import { ExchangeRate, DEFAULT_EXCHANGE_RATE_DATA } from '../application/exchange-rate';
import { CreatePropertyUseCase } from '../application/create-property.use-case';
import { FilterPropertiesUseCase } from '../application/filter-properties.use-case';
import { CalculatePropertyMetricsUseCase } from '../application/calculate-metrics.use-case';
import { PropertyLocalStorageRepository } from '../infrastructure/property-local-storage.repository';
import { ExchangeRateStorage } from '../infrastructure/exchange-rate.storage';

@Injectable()
export class PropertyRegisterFacade {
  private readonly propertyRepository = inject(PropertyRepository, { optional: true }) ?? new PropertyLocalStorageRepository();
  private readonly exchangeRateStorage = inject(ExchangeRateStorage, { optional: true }) ?? new ExchangeRateStorage();
  
  private readonly createPropertyUseCase = new CreatePropertyUseCase();
  private readonly filterPropertiesUseCase = new FilterPropertiesUseCase();
  private readonly calculateMetricsUseCase = new CalculatePropertyMetricsUseCase();

  readonly properties = signal<Property[]>([]);
  readonly exchangeRate = signal<ExchangeRate>(DEFAULT_EXCHANGE_RATE_DATA);
  readonly filter = signal<PropertyFilter>(DEFAULT_FILTER);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly filteredProperties = computed(() => {
    const rate = this.exchangeRate().value;
    return this.filterPropertiesUseCase.execute(this.properties(), this.filter(), rate);
  });

  readonly propertiesWithMetrics = computed(() => {
    const rate = this.exchangeRate().value;
    const filtered = this.filteredProperties();
    return this.calculateMetricsUseCase.executeMany(filtered, rate);
  });

  readonly stats = computed(() => {
    const withMetrics = this.propertiesWithMetrics();
    const total = withMetrics.length;
    const disponible = withMetrics.filter(p => p.status === 'disponible').length;
    const apartada = withMetrics.filter(p => p.status === 'apartada').length;
    const vendida = withMetrics.filter(p => p.status === 'vendida').length;
    const avgPricePerSqm = total > 0
      ? withMetrics.reduce((sum, p) => sum + p.pricePerSqmUsd, 0) / total
      : 0;
    const avgArea = total > 0
      ? withMetrics.reduce((sum, p) => sum + p.area, 0) / total
      : 0;

    return {
      total,
      disponible,
      apartada,
      vendida,
      avgPricePerSqm,
      avgArea,
    };
  });

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    this.isLoading.set(true);
    try {
      const properties = this.propertyRepository.getAll();
      this.properties.set(properties);
      
      const exchangeRate = this.exchangeRateStorage.get();
      this.exchangeRate.set(exchangeRate);
    } catch (e) {
      this.error.set('Error al cargar propiedades');
    } finally {
      this.isLoading.set(false);
    }
  }

  createProperty(request: CreatePropertyRequest): void {
    this.error.set(null);
    try {
      const property = this.createPropertyUseCase.execute(request);
      this.propertyRepository.save(property);
      this.properties.update(list => [...list, property]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Error al crear propiedad');
    }
  }

  updateProperty(request: UpdatePropertyRequest): void {
    this.error.set(null);
    try {
      const existing = this.propertyRepository.getById(request.id);
      if (!existing) {
        throw new Error('Propiedad no encontrada');
      }

      const updated = Property.reconstitute({
        ...existing.toPlain(),
        ...request,
        updatedAt: new Date().toISOString(),
      });

      this.propertyRepository.update(updated);
      this.properties.update(list =>
        list.map(p => p.id === request.id ? updated : p)
      );
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Error al actualizar propiedad');
    }
  }

  deleteProperty(id: string): void {
    this.error.set(null);
    try {
      this.propertyRepository.delete(id);
      this.properties.update(list => list.filter(p => p.id !== id));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Error al eliminar propiedad');
    }
  }

  updateFilter(update: Partial<PropertyFilter>): void {
    this.filter.update(current => ({ ...current, ...update }));
  }

  clearFilter(): void {
    this.filter.set(DEFAULT_FILTER);
  }

  updateExchangeRate(value: number): void {
    if (value <= 0) {
      this.error.set('El tipo de cambio debe ser mayor a 0');
      return;
    }
    const current = this.exchangeRate();
    const newRate = this.exchangeRateStorage.update(value, current.buyRate, current.sellRate);
    this.exchangeRate.set(newRate);
    this.error.set(null);
  }

  updateExchangeRateFull(buyRate: number, sellRate: number): void {
    if (buyRate <= 0 || sellRate <= 0) {
      this.error.set('Los tipos de cambio deben ser mayores a 0');
      return;
    }
    if (buyRate > sellRate) {
      this.error.set('El tipo de cambio compra no puede ser mayor al de venta');
      return;
    }
    const newRate = this.exchangeRateStorage.updateFull(buyRate, sellRate);
    this.exchangeRate.set(newRate);
    this.error.set(null);
  }

  resetExchangeRate(): void {
    this.exchangeRateStorage.reset();
    this.exchangeRate.set(DEFAULT_EXCHANGE_RATE_DATA);
  }

  getPropertyById(id: string): Property | null {
    return this.properties().find(p => p.id === id) ?? null;
  }
}