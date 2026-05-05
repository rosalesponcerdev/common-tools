# Domain Layer — Referencia Completa

El dominio es el corazón de la aplicación. No conoce Angular, HTTP, ni UI.

## Entidad — Patrón Completo

```typescript
// features/orders/domain/order.entity.ts

// Branded types para seguridad de tipos
export type OrderId = string & { readonly _brand: 'OrderId' };
export type CustomerId = string & { readonly _brand: 'CustomerId' };

export interface OrderProps {
  id: OrderId;
  customerId: CustomerId;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
}

export class Order {
  private readonly props: OrderProps;

  private constructor(props: OrderProps) {
    this.props = props;
  }

  // Factory: crear nueva entidad
  static create(props: Omit<OrderProps, 'id' | 'createdAt' | 'status'>): Order {
    return new Order({
      ...props,
      id: crypto.randomUUID() as OrderId,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    });
  }

  // Factory: reconstituir desde persistencia
  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  // Getters solo lectura
  get id(): OrderId {
    return this.props.id;
  }
  get status(): OrderStatus {
    return this.props.status;
  }
  get items(): readonly OrderItem[] {
    return this.props.items;
  }
  get customerId(): CustomerId {
    return this.props.customerId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Lógica de negocio como computed
  get total(): number {
    return this.props.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Reglas de negocio
  canBeCancelled(): boolean {
    return this.props.status === OrderStatus.PENDING;
  }

  // Métodos que retornan NUEVA instancia (inmutabilidad)
  cancel(): Order {
    if (!this.canBeCancelled()) {
      throw new OrderCannotBeCancelledException(this.props.id);
    }
    return new Order({ ...this.props, status: OrderStatus.CANCELLED });
  }

  confirm(): Order {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new InvalidOrderTransitionException(this.props.status, OrderStatus.CONFIRMED);
    }
    return new Order({ ...this.props, status: OrderStatus.CONFIRMED });
  }
}
```

## Value Object — Patrón Completo

```typescript
// features/orders/domain/order-item.value-object.ts

export interface OrderItemProps {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(props: OrderItemProps): OrderItem {
    if (props.quantity <= 0) throw new Error('Quantity must be positive');
    if (props.unitPrice < 0) throw new Error('Price cannot be negative');
    return new OrderItem(props);
  }

  get productId(): string {
    return this.props.productId;
  }
  get name(): string {
    return this.props.name;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unitPrice(): number {
    return this.props.unitPrice;
  }
  get subtotal(): number {
    return this.props.quantity * this.props.unitPrice;
  }

  equals(other: OrderItem): boolean {
    return this.props.productId === other.props.productId;
  }
}
```

## Puerto (Repository Interface)

```typescript
// features/orders/domain/order.repository.ts

// SIEMPRE abstract class, nunca interface — Angular DI necesita token en runtime
export abstract class OrderRepository {
  abstract findById(id: OrderId): Promise<Order | null>;
  abstract findByCustomer(customerId: CustomerId): Promise<Order[]>;
  abstract save(order: Order): Promise<void>;
  abstract delete(id: OrderId): Promise<void>;
}
```

## Enum de estados

```typescript
// features/orders/domain/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
```

## Errores de Dominio

```typescript
// features/orders/domain/order.errors.ts

export class OrderDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OrderCannotBeCancelledException extends OrderDomainError {
  constructor(orderId: OrderId) {
    super(`Order ${orderId} cannot be cancelled in its current state`);
  }
}

export class OrderNotFoundException extends OrderDomainError {
  constructor(orderId: OrderId) {
    super(`Order ${orderId} not found`);
  }
}

export class InvalidOrderTransitionException extends OrderDomainError {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot transition order from ${from} to ${to}`);
  }
}
```

## Checklist Domain Layer

- [ ] Sin imports de `@angular/*`
- [ ] Sin imports de `rxjs`
- [ ] Sin imports de `HttpClient`
- [ ] Entidades con constructor privado y factories estáticas
- [ ] Métodos de negocio retornan nueva instancia (inmutabilidad)
- [ ] Value objects con validación en `create()`
- [ ] Puertos como `abstract class`, no `interface`
- [ ] Errores de dominio propios, nunca `Error` genérico
- [ ] Testeable con Node puro, sin TestBed
