export class PropertyDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PropertyRequiredFieldError extends PropertyDomainError {
  constructor(field: string) {
    super(`El campo ${field} es requerido`);
  }
}

export class PropertyInvalidFieldError extends PropertyDomainError {
  constructor(field: string, reason: string) {
    super(`El campo ${field} es inválido: ${reason}`);
  }
}

export class PropertyNotFoundError extends PropertyDomainError {
  constructor(id: string) {
    super(`Propiedad con ID ${id} no encontrada`);
  }
}

export class PropertyStatusTransitionError extends PropertyDomainError {
  constructor(from: string, to: string) {
    super(`No se puede cambiar el estado de ${from} a ${to}`);
  }
}

export class PropertyConstructionYearRequiredError extends PropertyDomainError {
  constructor() {
    super('El año de construcción es requerido para casas y departamentos');
  }
}

export class PropertyInvalidPriceError extends PropertyDomainError {
  constructor() {
    super('El precio debe ser mayor a 0');
  }
}

export class PropertyInvalidAreaError extends PropertyDomainError {
  constructor() {
    super('El área debe ser mayor a 0');
  }
}