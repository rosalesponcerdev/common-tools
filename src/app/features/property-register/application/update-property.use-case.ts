import { Property } from '../domain/property.entity';
import { Location } from '../domain/location.value-object';
import { PropertyNotFoundError } from '../domain/property.errors';
import { UpdatePropertyRequest } from './dtos/property-request.dto';

export class UpdatePropertyUseCase {
  constructor(private readonly getPropertyById: (id: string) => Property | null) {}

  execute(request: UpdatePropertyRequest): Property {
    const existing = this.getPropertyById(request.id);
    if (!existing) {
      throw new PropertyNotFoundError(request.id);
    }

    const updated = Property.reconstitute({
      ...existing.toPlain(),
      id: request.id,
      type: request.type ?? existing.type,
      area: request.area ?? existing.area,
      pricePen: request.pricePen ?? existing.pricePen,
      location: request.location
        ? Location.create(request.location).toPlain()
        : existing.locationPlain,
      constructionYear: request.constructionYear ?? existing.constructionYear,
      description: request.description ?? existing.description,
      status: request.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  }
}
