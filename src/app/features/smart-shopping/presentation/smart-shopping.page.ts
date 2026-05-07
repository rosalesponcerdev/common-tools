import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SmartShoppingFacade } from './smart-shopping.facade';
import { ProductCreateComponent } from './product-create.component';
import { ProductCardComponent } from './product-card.component';
import { UnitOfMeasure } from '../domain';

@Component({
  selector: 'app-smart-shopping-page',
  imports: [FormsModule, ProductCreateComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './smart-shopping.page.html',
  styleUrl: './smart-shopping.page.css',
})
export class SmartShoppingPageComponent implements OnInit {
  readonly facade = inject(SmartShoppingFacade);

  ngOnInit(): void {
    this.facade.loadProducts();
  }

  onCreateProducts(names: string[]): void {
    this.facade.createProducts(names);
  }

  createQuickProduct(name: string): void {
    if (name.trim()) {
      this.facade.createProduct({ name });
    }
  }

  onAddPresentation(data: {
    brand: string;
    quantity: number;
    unit: UnitOfMeasure;
    price: number;
  }): void {
    const productId = this.facade.selectedProductId();
    if (productId) {
      this.facade.addPresentation({
        productId,
        brand: data.brand,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
      });
    }
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
}
