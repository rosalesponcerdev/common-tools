# Testing Pragmático con Jest

## Estrategia — Qué testear y con qué prioridad

```
ALTA PRIORIDAD (TDD aquí):
  domain/          → Entidades, value objects, reglas de negocio
  application/     → Use cases con mock repository

MEDIA PRIORIDAD:
  presentation/facades/    → Estado y orquestación con Signals
  infrastructure/          → Mappers, repositorios con HttpTestingController

BAJA / OPCIONAL:
  presentation/components/ → Solo si hay lógica relevante
  presentation/pages/      → Solo flujos críticos E2E-like
  templates triviales      → No testear
  wiring Angular básico    → No testear
```

## Test de Entidad de Dominio

```typescript
// features/orders/domain/order.entity.spec.ts
// No requiere TestBed — puro JavaScript

describe('Order', () => {
  const makeOrder = (status = OrderStatus.PENDING) =>
    Order.reconstitute({
      id: 'order-1' as OrderId,
      customerId: 'c1' as CustomerId,
      status,
      items: [OrderItem.create({ productId: 'p1', name: 'Widget', quantity: 2, unitPrice: 10 })],
      createdAt: new Date(),
    });

  describe('cancel()', () => {
    it('debería cancelar una orden pendiente', () => {
      const cancelled = makeOrder(OrderStatus.PENDING).cancel();
      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
    });

    it('debería lanzar al cancelar una orden confirmada', () => {
      expect(() => makeOrder(OrderStatus.CONFIRMED).cancel()).toThrow(
        OrderCannotBeCancelledException,
      );
    });
  });

  describe('total', () => {
    it('debería calcular el total correctamente', () => {
      expect(makeOrder().total).toBe(20); // 2 × 10
    });
  });
});
```

## Test de Value Object

```typescript
describe('OrderItem', () => {
  it('debería crear un item válido', () => {
    const item = OrderItem.create({ productId: 'p1', name: 'Test', quantity: 3, unitPrice: 5 });
    expect(item.subtotal).toBe(15);
  });

  it('debería lanzar con cantidad negativa', () => {
    expect(() =>
      OrderItem.create({ productId: 'p1', name: 'T', quantity: -1, unitPrice: 5 }),
    ).toThrow();
  });
});
```

## Test de Use Case

```typescript
// features/orders/application/cancel-order.use-case.spec.ts
describe('CancelOrderUseCase', () => {
  let useCase: CancelOrderUseCase;
  let repository: OrderMockRepository;

  beforeEach(() => {
    repository = new OrderMockRepository();

    TestBed.configureTestingModule({
      providers: [CancelOrderUseCase, { provide: OrderRepository, useValue: repository }],
    });

    useCase = TestBed.inject(CancelOrderUseCase);
  });

  it('debería cancelar una orden pendiente existente', async () => {
    const order = Order.create({
      customerId: 'c1' as CustomerId,
      items: [OrderItem.create({ productId: 'p1', name: 'T', quantity: 1, unitPrice: 5 })],
    });
    await repository.save(order);

    await useCase.execute(order.id);

    const saved = await repository.findById(order.id);
    expect(saved?.status).toBe(OrderStatus.CANCELLED);
  });

  it('debería lanzar OrderNotFoundException si no existe', async () => {
    await expect(useCase.execute('no-existe' as OrderId)).rejects.toThrow(OrderNotFoundException);
  });
});
```

## Test de Facade con Signals

```typescript
// features/orders/presentation/facades/orders.facade.spec.ts
describe('OrdersFacade', () => {
  let facade: OrdersFacade;
  let getOrdersUseCase: jest.Mocked<GetOrdersUseCase>;

  const mockOrders: OrderResponseDto[] = [
    { id: '1', customerId: 'c1', status: 'PENDING', total: 50, itemCount: 2, createdAt: '' },
  ];

  beforeEach(() => {
    getOrdersUseCase = { execute: jest.fn() } as any;

    TestBed.configureTestingModule({
      providers: [
        OrdersFacade,
        { provide: GetOrdersUseCase, useValue: getOrdersUseCase },
        { provide: CreateOrderUseCase, useValue: { execute: jest.fn() } },
        { provide: CancelOrderUseCase, useValue: { execute: jest.fn() } },
      ],
    });

    facade = TestBed.inject(OrdersFacade);
  });

  it('debería cargar órdenes y actualizar el estado', async () => {
    getOrdersUseCase.execute.mockResolvedValue(mockOrders);

    await facade.loadOrders('c1');

    expect(facade.orders()).toEqual(mockOrders);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('debería manejar errores y actualizar error signal', async () => {
    getOrdersUseCase.execute.mockRejectedValue(new Error('Network'));

    await facade.loadOrders('c1');

    expect(facade.orders()).toEqual([]);
    expect(facade.error()).toBe('Failed to load orders');
    expect(facade.loading()).toBe(false);
  });
});
```

## Test de Repositorio HTTP

```typescript
// features/orders/infrastructure/order-http.repository.spec.ts
describe('OrderHttpRepository', () => {
  let repo: OrderHttpRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderHttpRepository, provideHttpClient(), provideHttpClientTesting()],
    });

    repo = TestBed.inject(OrderHttpRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería retornar null en 404', async () => {
    const promise = repo.findById('missing' as OrderId);
    httpMock.expectOne('/api/orders/missing').flush({}, { status: 404, statusText: 'Not Found' });

    expect(await promise).toBeNull();
  });
});
```

## Test de Mapper

```typescript
describe('OrderApiMapper', () => {
  it('debería mapear raw API a dominio correctamente', () => {
    const raw = {
      order_id: 'o1',
      customer_id: 'c1',
      order_status: 'PENDING',
      line_items: [{ product_id: 'p1', product_name: 'Widget', qty: 2, unit_price: 10 }],
      created_at: '2024-01-01T00:00:00Z',
    };

    const order = OrderApiMapper.toDomain(raw);

    expect(order.id).toBe('o1');
    expect(order.total).toBe(20);
    expect(order.items).toHaveLength(1);
  });
});
```

## Configuración Jest (jest.config.ts)

```typescript
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
  },
};
```
