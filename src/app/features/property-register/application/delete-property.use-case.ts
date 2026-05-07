import { Property } from '../domain/property.entity';
import { PropertyNotFoundError } from '../domain/property.errors';

export class DeletePropertyUseCase {
  constructor(
    private readonly getPropertyById: (id: string) => Property | null,
    private readonly removeProperty: (id: string) => void,
  ) {}

  execute(id: string): void {
    const existing = this.getPropertyById(id);
    if (!existing) {
      throw new PropertyNotFoundError(id);
    }
    this.removeProperty(id);
  }
}
