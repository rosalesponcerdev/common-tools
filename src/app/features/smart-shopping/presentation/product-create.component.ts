import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { form, FormField, submit, required } from '@angular/forms/signals';

interface ProductCreateForm {
  productName: string;
}

@Component({
  selector: 'app-product-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
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
