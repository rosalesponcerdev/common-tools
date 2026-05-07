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
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
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
