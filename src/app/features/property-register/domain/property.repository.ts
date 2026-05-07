import { Property } from './property.entity';

export abstract class PropertyRepository {
  abstract getAll(): Property[];
  abstract getById(id: string): Property | null;
  abstract save(property: Property): void;
  abstract update(property: Property): void;
  abstract delete(id: string): void;
}
