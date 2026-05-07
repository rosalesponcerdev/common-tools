import { Property } from '../domain/property.entity';

export class GetPropertiesUseCase {
  constructor(private readonly getAll: () => Property[]) {}

  execute(): Property[] {
    return this.getAll().map((p) => p);
  }
}
