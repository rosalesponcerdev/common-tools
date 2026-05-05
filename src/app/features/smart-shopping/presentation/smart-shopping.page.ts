import { Component, ChangeDetectionStrategy, inject, OnInit, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SmartShoppingFacade } from './smart-shopping.facade';
import { UnitOfMeasure, formatUnitPrice, getUnitLabel } from '../domain';

@Component({
  selector: 'app-smart-shopping-page',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Main Container -->
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div class="max-w-2xl mx-auto px-4 py-6 sm:px-6">

        <!-- Header -->
        <header class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🛒</span>
              Smart Shopping
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Compara precios por unidad y ahorra
            </p>
          </div>
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">Ahorro</span>
            <span class="text-lg font-bold text-emerald-700 dark:text-emerald-400">100%</span>
          </div>
        </header>

        @if (facade.isLoading()) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <div class="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin mb-4"></div>
            <span>Cargando...</span>
          </div>
        } @else if (facade.error()) {
          <div class="flex flex-col items-center justify-center py-16 text-red-600 dark:text-red-400">
            <span class="text-3xl mb-2">⚠️</span>
            <span>{{ facade.error() }}</span>
          </div>
        } @else {
          <!-- Product Tabs -->
          <div class="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-2 px-2">
            @for (product of facade.products(); track product.id) {
              <button
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-all duration-150 whitespace-nowrap"
                [class.bg-emerald-600]="facade.selectedProductId() === product.id"
                [class.text-white]="facade.selectedProductId() === product.id"
                [class.border-emerald-600]="facade.selectedProductId() === product.id"
                [class.bg-white]="facade.selectedProductId() !== product.id"
                [class.text-gray-600]="facade.selectedProductId() !== product.id"
                [class.border-gray-200]="facade.selectedProductId() !== product.id"
                [class.hover:text-gray-900]="facade.selectedProductId() !== product.id"
                [class.hover:border-gray-300]="facade.selectedProductId() !== product.id"
                [class.dark:bg-slate-800]="facade.selectedProductId() !== product.id"
                [class.dark:text-gray-300]="facade.selectedProductId() !== product.id"
                [class.dark:border-slate-700]="facade.selectedProductId() !== product.id"
                [class.dark:hover:text-white]="facade.selectedProductId() !== product.id"
                [class.dark:hover:border-slate-600]="facade.selectedProductId() !== product.id"
                (click)="facade.selectProduct(product.id)"
              >
                <span>{{ product.name }}</span>
                @if (product.presentations.length > 0) {
                  <span class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    [class.bg-gray-100]="facade.selectedProductId() !== product.id"
                    [class.text-gray-600]="facade.selectedProductId() !== product.id"
                    [class.dark:bg-slate-700]="facade.selectedProductId() !== product.id"
                    [class.dark:text-gray-300]="facade.selectedProductId() !== product.id">
                    {{ product.presentations.length }}
                  </span>
                }
              </button>
            }
            @if (facade.products().length === 0) {
              <span class="text-sm text-gray-500 dark:text-gray-400 py-2">Sin productos</span>
            }
          </div>

          @if (facade.selectedProduct()) {
            <!-- Product Card -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
              <!-- Product Header -->
              <div class="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ facade.selectedProduct()?.name }}
                </h2>
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  (click)="deleteProduct()"
                  title="Eliminar"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>

              <!-- Add Presentation Form -->
              <div class="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 mb-5">
                <div class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  <span class="w-6 h-6 flex items-center justify-center bg-emerald-600 text-white rounded-full text-xs font-bold">+</span>
                  Nueva Presentación
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="col-span-2 sm:col-span-1">
                    <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Marca</label>
                    <input
                      #brandInput
                      type="text"
                      [(ngModel)]="newPresentation.brand"
                      placeholder="Costeño, Metro..."
                      class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Cantidad</label>
                    <input
                      type="number"
                      [(ngModel)]="newPresentation.quantity"
                      placeholder="750"
                      min="0"
                      step="0.01"
                      class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Unidad</label>
                    <select
                      [(ngModel)]="newPresentation.unit"
                      class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                      <option value="gr">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="lt">L</option>
                      <option value="unid">und</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Precio</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 dark:text-gray-500">S/</span>
                      <input
                        type="number"
                        [(ngModel)]="newPresentation.price"
                        placeholder="3.50"
                        min="0"
                        step="0.01"
                        (keyup.enter)="addPresentation()"
                        class="w-full pl-7 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <button
                  class="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-400"
                  (click)="addPresentation()"
                >
                  Agregar
                </button>
              </div>

              <!-- Search Filter -->
              <div class="relative mb-4">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  [(ngModel)]="brandFilterInput"
                  (input)="onBrandFilterChange()"
                  placeholder="Buscar marca..."
                  class="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>

              <!-- Comparison Table -->
              <div class="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <!-- Table Header - Desktop -->
                <div class="hidden sm:grid grid-cols-5 gap-2 px-4 py-3 bg-gray-900 dark:bg-slate-800">
                  <span class="col-span-1 text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">Marca</span>
                  <span class="col-span-1 text-center text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">Cantidad</span>
                  <span class="col-span-1 text-center text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">Precio</span>
                  <span class="col-span-1 text-center text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">x Unidad</span>
                  <span class="col-span-1 text-right"></span>
                </div>

                <!-- Table Body -->
                <div class="divide-y divide-gray-200 dark:divide-slate-700">
                  @for (pres of facade.selectedProductSorted(); track pres.id; let i = $index) {
                    <div
                      class="grid grid-cols-2 sm:grid-cols-5 gap-2 px-4 py-3 items-center"
                      [class.bg-emerald-50]="facade.selectedProductCheapest()?.id === pres.id"
                      [class.dark:bg-emerald-900/20]="facade.selectedProductCheapest()?.id === pres.id"
                      [style.animation-delay]="i * 30 + 'ms'"
                      style="animation: slideIn 0.3s ease-out forwards; opacity: 0;"
                    >
                      <!-- Brand -->
                      <div class="col-span-2 sm:col-span-1 flex items-center gap-2">
                        @if (facade.selectedProductCheapest()?.id === pres.id) {
                          <span class="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-md">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Mejor
                          </span>
                        }
                        <span class="font-semibold text-gray-900 dark:text-white">{{ pres.brand }}</span>
                      </div>

                      <!-- Quantity -->
                      <div class="text-center sm:col-span-1">
                        <span class="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">Cant:</span>
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {{ pres.quantity }}<span class="text-xs ml-0.5">{{ getUnitLabel(pres.unit) }}</span>
                        </span>
                      </div>

                      <!-- Price -->
                      <div class="text-center sm:col-span-1">
                        <span class="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">Precio:</span>
                        <span class="font-bold text-gray-900 dark:text-white">
                          S/ {{ pres.price.toFixed(2) }}
                        </span>
                      </div>

                      <!-- Unit Price -->
                      <div class="text-center sm:col-span-1">
                        <span class="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">xUnid:</span>
                        <span class="inline-block px-2.5 py-1 text-sm font-bold rounded-md"
                          [class.bg-emerald-100]="facade.selectedProductCheapest()?.id !== pres.id"
                          [class.text-emerald-700]="facade.selectedProductCheapest()?.id !== pres.id"
                          [class.dark:bg-emerald-900/50]="facade.selectedProductCheapest()?.id !== pres.id"
                          [class.dark:text-emerald-400]="facade.selectedProductCheapest()?.id !== pres.id"
                          [class.bg-emerald-600]="facade.selectedProductCheapest()?.id === pres.id"
                          [class.text-white]="facade.selectedProductCheapest()?.id === pres.id"
                          [class.dark:bg-emerald-500]="facade.selectedProductCheapest()?.id === pres.id">
                          {{ formatUnitPrice(pres.unitPrice, pres.unit) }}
                        </span>
                      </div>

                      <!-- Action -->
                      <div class="col-span-2 sm:col-span-1 flex justify-end">
                        <button
                          class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          (click)="deletePresentation(pres.id)"
                          title="Eliminar"
                        >
                          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              @if (facade.selectedProductSorted().length === 0) {
                <div class="text-center py-8">
                  <span class="text-4xl block mb-2 opacity-60">📝</span>
                  <p class="font-semibold text-gray-900 dark:text-white">No hay presentaciones</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Agrega una para comparar precios</p>
                </div>
              }
            </div>
          } @else {
            <!-- Create Product -->
            <div class="flex justify-center py-8">
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center max-w-sm shadow-sm">
                <span class="text-5xl block mb-4">🏷️</span>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Crear Producto</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Agrega un producto para comenzar a comparar precios
                </p>
                <div class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="newProductName"
                    placeholder="Arroz, Leche, Detergente..."
                    (keyup.enter)="createProduct()"
                    class="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                  <button
                    class="inline-flex items-center justify-center w-11 h-11 text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-400"
                    (click)="createProduct()"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class SmartShoppingPageComponent implements OnInit {
  readonly facade = inject(SmartShoppingFacade);
  readonly brandInput = viewChild.required<ElementRef<HTMLInputElement>>('brandInput');

  newProductName = '';
  brandFilterInput = '';

  newPresentation = {
    brand: '',
    quantity: 0,
    unit: 'gr' as UnitOfMeasure,
    price: 0,
  };

  ngOnInit(): void {
    this.facade.loadProducts();
  }

  getUnitLabel = getUnitLabel;
  formatUnitPrice = formatUnitPrice;

  createProduct(): void {
    if (this.newProductName.trim()) {
      this.facade.createProduct({ name: this.newProductName });
      this.newProductName = '';
    }
  }

  addPresentation(): void {
    const productId = this.facade.selectedProductId();
    if (!productId || !this.newPresentation.brand.trim() || this.newPresentation.quantity <= 0 || this.newPresentation.price <= 0) {
      return;
    }

    this.facade.addPresentation({
      productId,
      brand: this.newPresentation.brand,
      quantity: this.newPresentation.quantity,
      unit: this.newPresentation.unit,
      price: this.newPresentation.price,
    });

    this.newPresentation = {
      brand: '',
      quantity: 0,
      unit: 'gr',
      price: 0,
    };

    setTimeout(() => {
      this.brandInput().nativeElement.focus();
    }, 0);
  }

  deletePresentation(presentationId: string): void {
    const productId = this.facade.selectedProductId();
    if (productId) {
      this.facade.deletePresentation({ productId, presentationId });
    }
  }

  deleteProduct(): void {
    const productId = this.facade.selectedProductId();
    if (productId && confirm('¿Eliminar este producto y todas sus presentaciones?')) {
      this.facade.deleteProduct({ productId });
    }
  }

  onBrandFilterChange(): void {
    this.facade.setBrandFilter(this.brandFilterInput);
  }
}