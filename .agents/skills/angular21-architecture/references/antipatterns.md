# Anti-Patrones — Señales de Alarma

## ❌ Lógica de negocio en componentes

```typescript
// ❌ MAL
export class OrderDetailComponent {
  async cancelOrder(order: any) {
    if (order.status !== 'PENDING') {
      this.error = 'Cannot cancel';
      return;
    }
    await this.http.put(`/api/orders/${order.id}/cancel`).toPromise();
    order.status = 'CANCELLED';
  }
}

// ✅ BIEN
export class OrderDetailComponent {
  readonly facade = inject(OrdersFacade);
  cancelOrder(orderId: string) {
    this.facade.cancelOrder(orderId);
  }
}
```

## ❌ Servicios God

```typescript
// ❌ MAL: un servicio que hace todo
@Injectable({ providedIn: 'root' })
export class OrderService {
  getOrders() {}
  cancelOrder() {}
  createOrder() {}
  validateStock() {}
  sendEmail() {}
  generatePdf() {}
  // 20 métodos más...
}

// ✅ BIEN: un use case por responsabilidad
// GetOrdersUseCase · CancelOrderUseCase · CreateOrderUseCase
```

## ❌ Interface como puerto (en lugar de abstract class)

```typescript
// ❌ MAL: interface desaparece en runtime, Angular DI no puede inyectarla
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
}

// ✅ BIEN: abstract class es token inyectable en Angular
export abstract class OrderRepository {
  abstract findById(id: OrderId): Promise<Order | null>;
}
```

## ❌ Signals para streams async complejos

```typescript
// ❌ MAL: usar signal para WebSocket con retry/reconnect
readonly messages = signal<Message[]>([]);
// Manejar reconexión, backoff, etc. manualmente

// ✅ BIEN: RxJS para streams complejos, convertir a signal al final
readonly messages = toSignal(
  this.ws.connect().pipe(
    retry({ delay: 2000 }),
    scan((acc, msg) => [...acc, msg], [])
  ),
  { initialValue: [] }
);
```

## ❌ RxJS para estado local simple

```typescript
// ❌ MAL
private count$ = new BehaviorSubject(0);
readonly display$ = this.count$.pipe(map(n => `Count: ${n}`));

// ✅ BIEN
readonly count = signal(0);
readonly display = computed(() => `Count: ${this.count()}`);
```

## ❌ effect() para derivar estado

```typescript
// ❌ MAL: effect para derivar estado
effect(() => {
  this.filtered.set(this.orders().filter(o => o.status === this.filter()));
});

// ✅ BIEN: computed para estado derivado
readonly filtered = computed(() =>
  this.orders().filter(o => o.status === this.filter())
);
```

## ❌ Providers globales para servicios de feature

```typescript
// ❌ MAL: service disponible en toda la app
@Injectable({ providedIn: 'root' })
export class OrdersFacade { ... }

// ✅ BIEN: scoped al route de la feature
@Injectable()
export class OrdersFacade { ... }
// En orders.providers.ts → registrado en orders.routes.ts
providers: ordersProviders  // solo disponible en /orders/**
```

## ❌ Exponer entidades de dominio a la UI

```typescript
// ❌ MAL: el componente recibe la entidad de dominio
@Component({ template: '{{ order.total }}' })
export class OrderCard {
  readonly order = input.required<Order>(); // entidad de dominio!
}

// ✅ BIEN: usar DTOs en la presentación
@Component({ template: '{{ order.total }}' })
export class OrderCard {
  readonly order = input.required<OrderResponseDto>(); // DTO simple
}
```

## ❌ Demasiadas capas para CRUDs simples

```typescript
// ❌ MAL: para una pantalla de config simple
// ConfigDomainService + ConfigApplicationService +
// ConfigUseCaseFactory + AbstractConfigMapper +
// IConfigValidator + ConfigValidatorStrategy

// ✅ BIEN: empezar simple, escalar cuando hay razón real
// Si no hay lógica de negocio compleja: Facade → HttpClient directamente
// Añadir capas cuando el negocio lo justifique
```

## Checklist anti-patrones

- [ ] Sin `http.get()` en componentes
- [ ] Sin lógica condicional de negocio en templates
- [ ] Sin `@Injectable({ providedIn: 'root' })` en services de feature
- [ ] Sin `interface` como puerto (usar `abstract class`)
- [ ] Sin `BehaviorSubject` donde `signal()` es suficiente
- [ ] Sin `effect()` que haga `.set()` en otro signal
- [ ] Sin entidades de dominio en inputs de componentes
- [ ] Sin servicios con más de 7-8 métodos (dividir)
