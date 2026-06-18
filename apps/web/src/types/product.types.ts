export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  stock: number;
  price: number | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  avgRating: number;
  reviewCount: number;
  totalStock: number;
  isActive: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  primaryImage: string | null;
}

export interface ProductDetail extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  relatedProducts: Product[];
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'rating'
  | 'most_reviewed';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: SortOption;
}

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  primaryImage: string | null;
}
