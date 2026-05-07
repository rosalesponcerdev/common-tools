import { Property } from '../domain/property.entity';
import { PropertyRepository } from '../domain/property.repository';
import { PropertyProps } from '../domain/property.entity';

const PROPERTIES_KEY = 'property_register_properties';

export class PropertyLocalStorageRepository implements PropertyRepository {
  private getStoredProperties(): PropertyProps[] {
    const data = localStorage.getItem(PROPERTIES_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private setStoredProperties(properties: PropertyProps[]): void {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  }

  getAll(): Property[] {
    return this.getStoredProperties().map((p) => Property.reconstitute(p));
  }

  getById(id: string): Property | null {
    const all = this.getStoredProperties();
    const found = all.find((p) => p.id === id);
    return found ? Property.reconstitute(found) : null;
  }

  save(property: Property): void {
    const all = this.getStoredProperties();
    all.push(property.toPlain());
    this.setStoredProperties(all);
  }

  update(property: Property): void {
    const all = this.getStoredProperties();
    const index = all.findIndex((p) => p.id === property.id);
    if (index >= 0) {
      all[index] = property.toPlain();
      this.setStoredProperties(all);
    }
  }

  delete(id: string): void {
    const all = this.getStoredProperties();
    const filtered = all.filter((p) => p.id !== id);
    this.setStoredProperties(filtered);
  }

  clear(): void {
    localStorage.removeItem(PROPERTIES_KEY);
  }
}