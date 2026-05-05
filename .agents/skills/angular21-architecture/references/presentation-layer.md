# Presentation Layer — Referencia Completa

Standalone components, Signals, Facades, OnPush. Sin lógica de negocio.

## Facade — Estado con Signals

```typescript
// features/orders/presentation/facades/orders.facade.ts
import { Injectable, inject, signal, computed } from '@angular/core';

export interface OrdersUiState {
  orders: OrderResponseDto[];
  loading: boolean;
  error: string | null;
  selectedOrderId: string | null;
}

@Injectable()
export class OrdersFacade {
  private readonly getOrdersUseCase = inject(GetOrdersUseCase);
  private readonly createOrderUseCase = inject(CreateOrderUseCase);
  private readonly cancelOrderUseCase = inject(CancelOrderUseCase);

  // Estado privado
  private readonly _state = signal<OrdersUiState>({
    orders: [],
    loading: false,
    error: null,
    selectedOrderId: null,
  });

  // Selectores públicos (readonly signals)
  readonly orders = computed(() => this._state().orders);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly hasOrders = computed(() => this._state().orders.length > 0);
  readonly selectedOrder = computed(() => {
    const id = this._state().selectedOrderId;
    return id ? (this._state().orders.find((o) => o.id === id) ?? null) : null;
  });

  async loadOrders(customerId: string): Promise<void> {
    this.patchState({ loading: true, error: null });
    try {
      const orders = await this.getOrdersUseCase.execute(customerId);
      this.patchState({ orders, loading: false });
    } catch {
      this.patchState({ loading: false, error: 'Failed to load orders' });
    }
  }

  async createOrder(dto: CreateOrderDto): Promise<void> {
    this.patchState({ loading: true, error: null });
    try {
      const newOrder = await this.createOrderUseCase.execute(dto);
      this.patchState({
        orders: [...this._state().orders, newOrder],
        loading: false,
      });
    } catch {
      this.patchState({ loading: false, error: 'Failed to create order' });
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.cancelOrderUseCase.execute(orderId);
      const updated = this._state().orders.map((o) =>
        o.id === orderId ? { ...o, status: 'CANCELLED' } : o,
      );
      this.patchState({ orders: updated });
    } catch (err: any) {
      this.patchState({ error: err.message });
    }
  }

  selectOrder(id: string): void {
    this.patchState({ selectedOrderId: id });
  }

  private patchState(partial: Partial<OrdersUiState>): void {
    this._state.update((state) => ({ ...state, ...partial }));
  }
}
```

## Page (Smart Component)

```typescript
// features/orders/presentation/pages/orders-list.page.ts
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderCardComponent, LoadingSpinnerComponent, ErrorBannerComponent],
  template: `
    <div class="orders-page">
      <header>
        <h1>My Orders</h1>
        <button (click)="openCreateForm()">New Order</button>
      </header>

      @if (facade.loading()) {
        <app-loading-spinner />
      }

      @if (facade.error()) {
        <app-error-banner [message]="facade.error()!" />
      }

      @if (facade.hasOrders()) {
        <div class="orders-grid">
          @for (order of facade.orders(); track order.id) {
            <app-order-card
              [order]="order"
              [selected]="facade.selectedOrder()?.id === order.id"
              (select)="facade.selectOrder(order.id)"
              (cancel)="facade.cancelOrder(order.id)"
            />
          }
        </div>
      } @else if (!facade.loading()) {
        <p>No orders found.</p>
      }
    </div>
  `,
})
export class OrdersListPage implements OnInit {
  readonly facade = inject(OrdersFacade);

  ngOnInit(): void {
    this.facade.loadOrders('current-user-id');
  }

  openCreateForm(): void {
    /* navegación o modal */
  }
}
```

## Presentational Component (Dumb)

```typescript
// features/orders/presentation/components/order-card.component.ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-order-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="order-card" [class.selected]="selected()" (click)="select.emit()">
      <h3>Order #{{ order().id }}</h3>
      <p>Status: {{ order().status }}</p>
      <p>Total: {{ order().total | currency }}</p>

      @if (order().status === 'PENDING') {
        <button (click)="$event.stopPropagation(); cancel.emit(order().id)">Cancel</button>
      }
    </article>
  `,
})
export class OrderCardComponent {
  readonly order = input.required<OrderResponseDto>();
  readonly selected = input<boolean>(false);
  readonly select = output<void>();
  readonly cancel = output<string>();
}
```

## Providers de Feature (DI scoped)

```typescript
// features/orders/orders.providers.ts
import { Provider } from '@angular/core';

export const ordersProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderHttpRepository },
  CreateOrderUseCase,
  GetOrdersUseCase,
  CancelOrderUseCase,
  OrdersFacade,
];

// Para testing / desarrollo
export const ordersMockProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMockRepository },
  CreateOrderUseCase,
  GetOrdersUseCase,
  CancelOrderUseCase,
  OrdersFacade,
];
```

## Rutas con Lazy Loading y providers scoped

```typescript
// features/orders/orders.routes.ts
import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: ordersProviders, // DI scoped a esta feature, no global
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/orders-list.page').then((m) => m.OrdersListPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./presentation/pages/order-detail.page').then((m) => m.OrderDetailPage),
      },
    ],
  },
];
```

## Checklist Presentation Layer

- [ ] `ChangeDetectionStrategy.OnPush` en TODOS los componentes
- [ ] `standalone: true` en todos los componentes
- [ ] `input()` / `output()` en lugar de `@Input()` / `@Output()`
- [ ] Control flow `@if`, `@for` con `track`, `@switch`
- [ ] Pages solo inyectan Facade, nunca use cases directamente
- [ ] Dumb components: solo inputs, outputs y template
- [ ] Facade es el único punto de gestión de estado UI
- [ ] Providers registrados en rutas (scoped), no `providedIn: 'root'`
- [ ] Cero lógica de negocio en templates o componentes
