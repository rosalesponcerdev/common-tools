import { Injectable, computed, signal } from '@angular/core';
import {
  Product,
  Presentation,
  sortPresentationsByUnitPrice,
  findCheapestPresentation,
  filterPresentationsByBrand,
  UnitOfMeasure,
} from '../domain';
import {
  GetProductsUseCase,
  CreateProductUseCase,
  AddPresentationUseCase,
  UpdatePresentationUseCase,
  DeleteProductUseCase,
  DeletePresentationUseCase,
  CreateProductInput,
  AddPresentationInput,
  UpdatePresentationInput,
  DeleteProductInput,
  DeletePresentationInput,
} from '../application';

export interface ProductWithSortedPresentations extends Product {
  sortedPresentations: Presentation[];
  cheapestPresentation: Presentation | null;
}

@Injectable()
export class SmartShoppingFacade {
  readonly products = signal<Product[]>([]);
  readonly selectedProductId = signal<string | null>(null);
  readonly brandFilter = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly selectedProduct = computed(() => {
    const id = this.selectedProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  readonly productsWithCalculations = computed<ProductWithSortedPresentations[]>(() => {
    return this.products().map((product) => {
      const sorted = sortPresentationsByUnitPrice(product.presentations);
      const cheapest = findCheapestPresentation(product.presentations);
      return {
        ...product,
        sortedPresentations: sorted,
        cheapestPresentation: cheapest,
      };
    });
  });

  readonly selectedProductSorted = computed(() => {
    const product = this.selectedProduct();
    if (!product) return [];
    const filtered = filterPresentationsByBrand(product.presentations, this.brandFilter());
    return sortPresentationsByUnitPrice(filtered);
  });

  readonly selectedProductCheapest = computed(() => {
    const product = this.selectedProduct();
    if (!product || product.presentations.length === 0) return null;
    return findCheapestPresentation(product.presentations);
  });

  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly addPresentationUseCase: AddPresentationUseCase,
    private readonly updatePresentationUseCase: UpdatePresentationUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly deletePresentationUseCase: DeletePresentationUseCase,
  ) {}

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const products = await this.getProductsUseCase.execute();
      this.products.set(products);
      if (products.length > 0 && !this.selectedProductId()) {
        this.selectedProductId.set(products[0].id);
      }
    } catch (e) {
      this.error.set('Error al cargar productos');
    } finally {
      this.isLoading.set(false);
    }
  }

  async createProduct(input: CreateProductInput): Promise<void> {
    this.error.set(null);
    try {
      const product = await this.createProductUseCase.execute(input);
      this.products.update((current) => [...current, product]);
      this.selectedProductId.set(product.id);
    } catch (e) {
      this.error.set('Error al crear producto');
    }
  }

  async createProducts(names: string[]): Promise<void> {
    if (names.length === 0) return;
    this.error.set(null);
    try {
      const newProducts: Product[] = [];
      for (const name of names) {
        const product = await this.createProductUseCase.execute({ name });
        newProducts.push(product);
      }
      this.products.update((current) => [...current, ...newProducts]);
      this.selectedProductId.set(newProducts[0].id);
    } catch (e) {
      this.error.set('Error al crear productos');
    }
  }

  async addPresentation(input: AddPresentationInput): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.addPresentationUseCase.execute(input);
      if (updated) {
        this.products.update((current) => current.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch (e) {
      this.error.set('Error al agregar presentación');
    }
  }

  async updatePresentation(input: UpdatePresentationInput): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.updatePresentationUseCase.execute(input);
      if (updated) {
        this.products.update((current) => current.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch (e) {
      this.error.set('Error al actualizar presentación');
    }
  }

  async deleteProduct(input: DeleteProductInput): Promise<void> {
    this.error.set(null);
    try {
      const deleted = await this.deleteProductUseCase.execute(input);
      if (deleted) {
        this.products.update((current) => current.filter((p) => p.id !== input.productId));
        if (this.selectedProductId() === input.productId) {
          const remaining = this.products();
          this.selectedProductId.set(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (e) {
      this.error.set('Error al eliminar producto');
    }
  }

  async deletePresentation(input: DeletePresentationInput): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.deletePresentationUseCase.execute(input);
      if (updated) {
        this.products.update((current) => current.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch (e) {
      this.error.set('Error al eliminar presentación');
    }
  }

  selectProduct(id: string): void {
    this.selectedProductId.set(id);
    this.brandFilter.set('');
  }

  setBrandFilter(filter: string): void {
    this.brandFilter.set(filter);
  }
}
