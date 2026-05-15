import { Product, ProductVariant } from './product.types';

export interface CartItem {
  id: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'isActive'> & {
    primaryImage: string | null;
    isDeleted?: boolean;
  };
  variant: Pick<
    ProductVariant,
    'id' | 'name' | 'value' | 'stock' | 'price'
  > | null;
  itemTotal: number;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
