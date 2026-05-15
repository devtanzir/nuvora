import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';
import { Category, Product, ProductDetail, ProductFilters } from '../types/product.types';

export const productService = {
  getProducts: async (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const res = await api.get<
      ApiResponse<{ products: Product[]; meta: Record<string, unknown> }>
    >(`/products?${params.toString()}`);
    return res.data.data;
  },

  getProduct: async (slug: string): Promise<ProductDetail> => {
    const res = await api.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  getCategory: async (slug: string): Promise<Category> => {
    const res = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data.data;
  },
};
