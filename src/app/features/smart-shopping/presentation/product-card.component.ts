import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresentationFormComponent } from './presentation-form.component';
import { Product, Presentation, UnitOfMeasure, formatUnitPrice, getUnitLabel } from '../domain';

@Component({
  selector: 'app-product-card',
  imports: [FormsModule, PresentationFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Product Card -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm"
    >
      <!-- Product Header -->
      <div
        class="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-slate-700"
      >
        <div class="flex items-center gap-3">
          @if (showNewProductInput()) {
            <div class="flex items-center gap-1">
              <input
                #quickInput
                type="text"
                [(ngModel)]="quickProductName"
                (keydown.enter)="onCreateQuickProduct()"
                (keydown.escape)="closeQuickInput()"
                placeholder="Nuevo producto..."
                class="w-40 px-2.5 py-1.5 text-sm bg-white dark:bg-slate-800 border border-emerald-500 dark:border-emerald-400 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                class="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                (click)="onCreateQuickProduct()"
                title="Crear"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </button>
              <button
                class="p-1.5 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-slate-700 rounded-lg transition-colors"
                (click)="closeQuickInput()"
                title="Cancelar"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          } @else {
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ product().name }}
            </h2>
            <button
              class="inline-flex items-center justify-center w-7 h-7 text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-lg transition-colors"
              (click)="showNewProductInput.set(true)"
              title="Crear otro producto"
            >
              +
            </button>
          }
        </div>
        <button
          class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          (click)="deleteProduct.emit()"
          title="Eliminar"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <!-- Add Presentation Form -->
      <app-presentation-form (add)="addPresentation.emit($event)" />

      <!-- Search Filter -->
      <div class="relative mb-4">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
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
        <div class="hidden sm:grid grid-cols-5 gap-4 px-4 py-4 bg-gray-900 dark:bg-slate-800">
          <span class="col-span-1 text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">Marca</span>
          <span class="col-span-1 text-center text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">Cantidad</span>
          <span class="col-span-1 text-center text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">Precio</span>
          <span class="col-span-1 text-center text-xs font-bold text-white dark:text-slate-200 uppercase tracking-wider">x Unidad</span>
          <span class="col-span-1 text-right"></span>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-gray-200 dark:divide-slate-700">
          @for (pres of sortedPresentations(); track pres.id; let i = $index) {
            <div
              class="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 px-3 sm:px-4 py-4 items-center"
              [class.bg-emerald-50]="cheapestPresentation()?.id === pres.id"
              [class.dark:bg-emerald-900/20]="cheapestPresentation()?.id === pres.id"
              [style.animation-delay]="i * 30 + 'ms'"
              style="animation: slideIn 0.3s ease-out forwards; opacity: 0;"
            >
              <!-- Brand -->
              <div class="col-span-2 sm:col-span-1 flex items-center gap-2">
                @if (cheapestPresentation()?.id === pres.id) {
                  <span class="shrink-0 inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-md">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
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
                <span class="font-bold text-gray-900 dark:text-white">S/ {{ pres.price.toFixed(2) }}</span>
              </div>

              <!-- Unit Price -->
              <div class="text-center sm:col-span-1">
                <span class="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">xUnid:</span>
                <span
                  class="inline-block px-2.5 py-1 text-sm font-bold rounded-md"
                  [class.bg-emerald-100]="cheapestPresentation()?.id !== pres.id"
                  [class.text-emerald-700]="cheapestPresentation()?.id !== pres.id"
                  [class.dark:bg-emerald-900/50]="cheapestPresentation()?.id !== pres.id"
                  [class.dark:text-emerald-400]="cheapestPresentation()?.id !== pres.id"
                  [class.bg-emerald-600]="cheapestPresentation()?.id === pres.id"
                  [class.text-white]="cheapestPresentation()?.id === pres.id"
                  [class.dark:bg-emerald-500]="cheapestPresentation()?.id === pres.id"
                >
                  {{ formatUnitPrice(pres.unitPrice, pres.unit) }}
                </span>
              </div>

              <!-- Action -->
              <div class="col-span-2 sm:col-span-1 flex justify-end">
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  (click)="deletePresentation.emit(pres.id)"
                  title="Eliminar"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      @if (sortedPresentations().length === 0) {
        <div class="text-center py-8">
          <span class="text-4xl block mb-2 opacity-60">📝</span>
          <p class="font-semibold text-gray-900 dark:text-white">No hay presentaciones</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Agrega una para comparar precios</p>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly brandFilter = input('');

  readonly addPresentation = output<{ brand: string; quantity: number; unit: UnitOfMeasure; price: number }>();
  readonly deleteProduct = output<void>();
  readonly deletePresentation = output<string>();
  readonly createQuickProduct = output<string>();
  readonly setBrandFilter = output<string>();

  showNewProductInput = signal(false);
  quickProductName = '';
  brandFilterInput = '';

  sortedPresentations = computed(() => {
    const presentations = this.product().presentations;
    const filter = this.brandFilterInput.toLowerCase();
    const filtered = filter
      ? presentations.filter(p => p.brand.toLowerCase().includes(filter))
      : presentations;
    return [...filtered].sort((a, b) => (a.unitPrice ?? 0) - (b.unitPrice ?? 0));
  });

  cheapestPresentation = computed(() => {
    const presentations = this.sortedPresentations();
    if (presentations.length === 0) return null;
    return presentations[0];
  });

  getUnitLabel = getUnitLabel;
  formatUnitPrice = formatUnitPrice;

  onCreateQuickProduct(): void {
    if (this.quickProductName.trim()) {
      this.createQuickProduct.emit(this.quickProductName);
      this.quickProductName = '';
      this.showNewProductInput.set(false);
    }
  }

  closeQuickInput(): void {
    this.showNewProductInput.set(false);
    this.quickProductName = '';
  }

  onBrandFilterChange(): void {
    this.setBrandFilter.emit(this.brandFilterInput);
  }
}