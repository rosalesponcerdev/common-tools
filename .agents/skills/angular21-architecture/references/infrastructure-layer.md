# Infrastructure Layer — Referencia Completa

Aquí vive Angular, HttpClient, RxJS. Implementa los puertos del dominio.

## Mapper API ↔ Domain

```typescript
// features/orders/infrastructure/order-api.mapper.ts

// Tipo que representa la respuesta cruda de la API
interface OrderApiResponse {
  order_id: string;
  customer_id: string;
  order_status: string;
  line_items: {
    product_id: string;
    product_name: string;
    qty: number;
    unit_price: number;
  }[];
  created_at: string;
}

export class OrderApiMapper {
  static toDomain(raw: OrderApiResponse): Order {
    const items = raw.line_items.map((item) =>
      OrderItem.create({
        productId: item.product_id,
        name: item.product_name,
        quantity: item.qty,
        unitPrice: item.unit_price,
      }),
    );
    return Order.reconstitute({
      id: raw.order_id as OrderId,
      customerId: raw.customer_id as CustomerId,
      status: raw.order_status as OrderStatus,
      items,
      createdAt: new Date(raw.created_at),
    });
  }

  static toApiPayload(order: Order): Partial<OrderApiResponse> {
    return {
      customer_id: order.customerId,
      line_items: order.items.map((item) => ({
        product_id: item.productId,
        product_name: item.name,
        qty: item.quantity,
        unit_price: item.unitPrice,
      })),
    };
  }
}
```

## Repositorio HTTP (Adapter concreto)

```typescript
// features/orders/infrastructure/order-http.repository.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderHttpRepository extends OrderRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  async findById(id: OrderId): Promise<Order | null> {
    try {
      const raw = await firstValueFrom(this.http.get<OrderApiResponse>(`${this.baseUrl}/${id}`));
      return OrderApiMapper.toDomain(raw);
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findByCustomer(customerId: CustomerId): Promise<Order[]> {
    const raws = await firstValueFrom(
      this.http.get<OrderApiResponse[]>(`${this.baseUrl}?customerId=${customerId}`),
    );
    return raws.map(OrderApiMapper.toDomain);
  }

  async save(order: Order): Promise<void> {
    const payload = OrderApiMapper.toApiPayload(order);
    await firstValueFrom(this.http.post(this.baseUrl, payload));
  }

  async delete(id: OrderId): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
  }
}
```

## Repositorio Mock (para tests y desarrollo)

```typescript
// features/orders/infrastructure/order-mock.repository.ts

export class OrderMockRepository extends OrderRepository {
  private store = new Map<OrderId, Order>();

  async findById(id: OrderId): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByCustomer(customerId: CustomerId): Promise<Order[]> {
    return [...this.store.values()].filter((o) => o.customerId === customerId);
  }

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async delete(id: OrderId): Promise<void> {
    this.store.delete(id);
  }

  // Helper para tests
  seed(orders: Order[]): void {
    orders.forEach((o) => this.store.set(o.id, o));
  }
}
```

## Checklist Infrastructure Layer

- [ ] Mapper existe para cada API externa (no mapear en el repositorio)
- [ ] Usar `firstValueFrom()` para convertir Observable → Promise
- [ ] Manejar errores HTTP aquí (ej: 404 → return null)
- [ ] Mock repository disponible para testing y desarrollo
- [ ] El adapter extiende el `abstract class` del puerto del dominio
- [ ] No exponer raw types de la API fuera de esta capa
