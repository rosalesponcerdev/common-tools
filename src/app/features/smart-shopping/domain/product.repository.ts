import { Product } from './product.entity';

export abstract class ProductRepository {
  abstract getAll(): Promise<Product[]>;
  abstract getById(id: string): Promise<Product | null>;
  abstract save(product: Product): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract saveAll(products: Product[]): Promise<void>;
}
