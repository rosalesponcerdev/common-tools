import { Injectable } from '@angular/core';
import { ProductRepository, Product } from '../domain';

const STORAGE_KEY = 'smart-shopping-products';

@Injectable()
export class ProductLocalStorageRepository extends ProductRepository {
  async getAll(): Promise<Product[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as Product[];
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<Product | null> {
    const products = await this.getAll();
    return products.find((p) => p.id === id) || null;
  }

  async save(product: Product): Promise<void> {
    const products = await this.getAll();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    await this.saveAll(products);
  }

  async delete(id: string): Promise<void> {
    const products = await this.getAll();
    const filtered = products.filter((p) => p.id !== id);
    await this.saveAll(filtered);
  }

  async saveAll(products: Product[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}