import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { form, FormField, submit, required } from '@angular/forms/signals';

interface ProductCreateForm {
  productName: string;
}

@Component({
  selector: 'app-product-create',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-center py-8">
      <div
        class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center max-w-sm shadow-sm"
      >
        <span class="text-5xl block mb-4">🏷️</span>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Crear Producto</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Agrega uno o varios productos separados por comas o saltos de línea
        </p>
        <form (submit)="onSubmit(); $event.preventDefault()">
          <div class="flex gap-2">
            <textarea
              [formField]="productForm.productName"
              placeholder="Arroz, Leche&#10;Detergente, Fideos..."
              rows="3"
              class="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors resize-none"
            ></textarea>
            <button
              type="submit"
              class="inline-flex items-center justify-center w-11 h-11 text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProductCreateComponent {
  readonly createProducts = output<string[]>();

  readonly model = signal<ProductCreateForm>({
    productName: '',
  });

  readonly productForm = form(this.model, (s) => {
    required(s.productName, { message: 'Ingresa al menos un producto' });
  });

  onSubmit() {
    submit(this.productForm, async () => {
      const productName = this.model().productName;
      if (!productName.trim()) return;

      const names = productName
        .split(/[,\n]/)
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      if (names.length > 0) {
        this.createProducts.emit(names);
        this.model.set({ productName: '' });
      }
    });
  }
}