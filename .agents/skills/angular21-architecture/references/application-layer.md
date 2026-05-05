# Application Layer — Referencia Completa

Orquesta dominio e infraestructura. Cada use case = una acción del negocio.

## DTOs

```typescript
// features/orders/application/dtos/create-order.dto.ts
export interface CreateOrderItemDto {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDto {
  customerId: string;
  items: CreateOrderItemDto[];
}

// features/orders/application/dtos/order-response.dto.ts
export interface OrderResponseDto {
  id: string;
  customerId: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}
```

## Use Case — Create

```typescript
// features/orders/application/create-order.use-case.ts
import { inject, Injectable } from '@angular/core';

@Injectable()
export class CreateOrderUseCase {
  private readonly orderRepository = inject(OrderRepository);

  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const items = dto.items.map((item) =>
      OrderItem.create({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    );

    const order = Order.create({
      customerId: dto.customerId as CustomerId,
      items,
    });

    await this.orderRepository.save(order);
    return this.toDto(order);
  }

  private toDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      total: order.total,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
```

## Use Case — Get List

```typescript
// features/orders/application/get-orders.use-case.ts
import { inject, Injectable } from '@angular/core';

@Injectable()
export class GetOrdersUseCase {
  private readonly orderRepository = inject(OrderRepository);

  async execute(customerId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByCustomer(customerId as CustomerId);
    return orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      total: order.total,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    }));
  }
}
```

## Use Case — Cancel (con regla de dominio)

```typescript
// features/orders/application/cancel-order.use-case.ts
import { inject, Injectable } from '@angular/core';

@Injectable()
export class CancelOrderUseCase {
  private readonly orderRepository = inject(OrderRepository);

  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId as OrderId);
    if (!order) throw new OrderNotFoundException(orderId as OrderId);

    const cancelledOrder = order.cancel(); // lanza si no puede
    await this.orderRepository.save(cancelledOrder);
  }
}
```

## Checklist Application Layer

- [ ] Cada use case tiene un solo método `execute()`
- [ ] Depende únicamente de puertos del dominio (abstract class)
- [ ] Usa DTOs propios (no expone entidades de dominio)
- [ ] No hace HTTP directamente
- [ ] Errores de dominio se propagan sin capturar (la presentation los maneja)
- [ ] Fácilmente testeable con mock repository
