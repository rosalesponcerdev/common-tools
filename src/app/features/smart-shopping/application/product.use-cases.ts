import { inject } from '@angular/core';
import { ProductRepository, Product, createProduct, createPresentation, addPresentationToProduct, updatePresentationInProduct, removePresentationFromProduct, UnitOfMeasure } from '../domain';

export class GetProductsUseCase {
  private readonly repository = inject(ProductRepository);

  async execute(): Promise<Product[]> {
    return this.repository.getAll();
  }
}

export interface CreateProductInput {
  name: string;
}

export class CreateProductUseCase {
  private readonly repository = inject(ProductRepository);

  async execute(input: CreateProductInput): Promise<Product> {
    const product = createProduct(input.name);
    const existingProducts = await this.repository.getAll();
    await this.repository.saveAll([...existingProducts, product]);
    return product;
  }
}

export interface AddPresentationInput {
  productId: string;
  brand: string;
  quantity: number;
  unit: UnitOfMeasure;
  price: number;
}

export class AddPresentationUseCase {
  private readonly repository = inject(ProductRepository);

  async execute(input: AddPresentationInput): Promise<Product | null> {
    const product = await this.repository.getById(input.productId);
    if (!product) return null;

    const presentation = createPresentation(input.brand, input.quantity, input.unit, input.price);
    const updatedProduct = addPresentationToProduct(product, presentation);
    await this.repository.save(updatedProduct);
    return updatedProduct;
  }
}

export interface UpdatePresentationInput {
  productId: string;
  presentationId: string;
  brand?: string;
  quantity?: number;
  unit?: UnitOfMeasure;
  price?: number;
}

export class UpdatePresentationUseCase {
  private readonly repository = inject(ProductRepository);

  async execute(input: UpdatePresentationInput): Promise<Product | null> {
    const product = await this.repository.getById(input.productId);
    if (!product) return null;

    const updates: Partial<{ brand: string; quantity: number; unit: UnitOfMeasure; price: number }> = {};
    if (input.brand !== undefined) updates.brand = input.brand;
    if (input.quantity !== undefined) updates.quantity = input.quantity;
    if (input.unit !== undefined) updates.unit = input.unit;
    if (input.price !== undefined) updates.price = input.price;

    const updatedProduct = updatePresentationInProduct(product, input.presentationId, updates);
    await this.repository.save(updatedProduct);
    return updatedProduct;
  }
}

export interface DeleteProductInput {
  productId: string;
}

export class DeleteProductUseCase {
  private readonly repository = inject(ProductRepository);

  async execute(input: DeleteProductInput): Promise<boolean> {
    const product = await this.repository.getById(input.productId);
    if (!product) return false;

    await this.repository.delete(input.productId);
    return true;
  }
}

export interface DeletePresentationInput {
  productId: string;
  presentationId: string;
}

export class DeletePresentationUseCase {
  private readonly repository = inject(ProductRepository);

  async execute(input: DeletePresentationInput): Promise<Product | null> {
    const product = await this.repository.getById(input.productId);
    if (!product) return null;

    const updatedProduct = removePresentationFromProduct(product, input.presentationId);
    await this.repository.save(updatedProduct);
    return updatedProduct;
  }
}