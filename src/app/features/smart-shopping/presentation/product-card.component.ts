import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { PresentationFormComponent } from './presentation-form.component';
import { Product, UnitOfMeasure, formatUnitPrice, getUnitLabel } from '../domain';

interface ProductCardForm {
  quickProductName: string;
  brandFilter: string;
}

@Component({
  selector: 'app-product-card',
  imports: [FormField, PresentationFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Product Card -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm"
    >
      <!-- Product Header -->
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700"
      >
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          @if (showQuickInput()) {
            <form
              (submit)="onSubmitQuickProduct(); $event.preventDefault()"
              class="flex items-center gap-1"
            >
              <input
                #quickInput
                type="text"
                [formField]="productCardForm.quickProductName"
                placeholder="Nuevo..."
                class="min-w-0 flex-1 sm:flex-none sm:w-36 px-2.5 py-1.5 text-sm bg-white dark:bg-slate-800 border border-emerald-500 dark:border-emerald-400 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                class="shrink-0 p-1.5 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </button>
              <button
                type="button"
                class="shrink-0 p-1.5 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-slate-700 rounded-lg transition-colors"
                (click)="closeQuickInput()"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </form>
          } @else {
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {{ product().name }}
            </h2>
            <button
              class="shrink-0 w-7 h-7 flex items-center justify-center text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-lg transition-colors"
              (click)="showQuickInput.set(true)"
            >
              +
            </button>
          }
        </div>
        <button
          class="self-end sm:self-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          (click)="deleteProduct.emit()"
          title="Eliminar"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
            />
          </svg>
        </button>
      </header>

      <!-- Add Presentation Form -->
      <app-presentation-form (add)="addPresentation.emit($event)" />

      <!-- Search Filter -->
      <div class="relative mb-3 sm:mb-4">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
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
          [formField]="productCardForm.brandFilter"
          placeholder="Buscar marca..."
          class="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
        />
      </div>

      <!-- Comparison Table -->
      <div class="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <!-- Desktop Header -->
        <div
          class="hidden sm:grid grid-cols-12 gap-2 lg:gap-4 px-4 py-3 bg-gray-900 dark:bg-slate-800"
        >
          <span class="col-span-3 text-xs font-bold text-white uppercase tracking-wider"
            >Marca</span
          >
          <span class="col-span-2 text-center text-xs font-bold text-white uppercase tracking-wider"
            >Cantidad</span
          >
          <span class="col-span-3 text-center text-xs font-bold text-white uppercase tracking-wider"
            >Precio</span
          >
          <span class="col-span-3 text-center text-xs font-bold text-white uppercase tracking-wider"
            >x Unidad</span
          >
          <span class="col-span-1 text-right"></span>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-gray-200 dark:divide-slate-700">
          @for (pres of sortedPresentations(); track pres.id; let i = $index) {
            <!-- Desktop Table Layout -->
            <div
              class="grid grid-cols-[1fr_2rem] grid-rows-4 sm:grid-rows-none sm:grid-cols-12 gap-2 lg:gap-4 px-4 py-3 items-center"
              [class.bg-emerald-50]="cheapestPresentation()?.id === pres.id"
              [class.dark:bg-emerald-900/20]="cheapestPresentation()?.id === pres.id"
              [style.animation-delay]="i * 30 + 'ms'"
              style="animation: slideIn 0.3s ease-out forwards; opacity: 0;"
            >
              <div class="sm:col-span-3 flex justify-center sm:items-center gap-2">
                @if (cheapestPresentation()?.id === pres.id) {
                  <span
                    class="shrink-0 px-2 py-1 text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-md flex items-center gap-1"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      />
                    </svg>
                  </span>
                }
                <span class="font-semibold text-gray-900 dark:text-white truncate">{{
                  pres.brand
                }}</span>
              </div>
              <div
                class="sm:col-span-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {{ pres.quantity }}{{ getUnitLabel(pres.unit) }}
              </div>
              <div class="sm:col-span-3 text-center font-bold text-gray-900 dark:text-white">
                S/ {{ pres.price.toFixed(2) }}
              </div>
              <div class="sm:col-span-3 text-center">
                <span
                  class="px-2 py-1 text-sm font-bold rounded-md"
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
              <div
                class="col-start-2 row-start-1 row-span-full sm:col-span-1 sm:row-start-auto sm:row-span-1 self-center"
              >
                <button
                  class="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-lg transition-colors"
                  (click)="deletePresentation.emit(pres.id)"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
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
          <span class="text-4xl mb-2 block opacity-60">📝</span>
          <p class="font-semibold text-gray-900 dark:text-white">No hay presentaciones</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Agrega una para comparar precios</p>
        </div>
      }
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
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly brandFilter = input('');

  readonly addPresentation = output<{
    brand: string;
    quantity: number;
    unit: UnitOfMeasure;
    price: number;
  }>();
  readonly deleteProduct = output<void>();
  readonly deletePresentation = output<string>();
  readonly createQuickProduct = output<string>();
  readonly setBrandFilter = output<string>();

  showQuickInput = signal(false);

  readonly model = signal<ProductCardForm>({
    quickProductName: '',
    brandFilter: '',
  });

  readonly productCardForm = form(this.model);

  constructor() {
    effect(() => {
      const filter = this.model().brandFilter;
      this.setBrandFilter.emit(filter);
    });
  }

  sortedPresentations = computed(() => {
    const presentations = this.product().presentations;
    const filter = this.model().brandFilter.toLowerCase();
    const filtered = filter
      ? presentations.filter((p) => p.brand.toLowerCase().includes(filter))
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

  onSubmitQuickProduct(): void {
    const quickProductName = this.model().quickProductName;
    if (quickProductName.trim()) {
      this.createQuickProduct.emit(quickProductName);
      this.model.update((m) => ({ ...m, quickProductName: '' }));
      this.showQuickInput.set(false);
    }
  }

  closeQuickInput(): void {
    this.showQuickInput.set(false);
    this.model.update((m) => ({ ...m, quickProductName: '' }));
  }
}
