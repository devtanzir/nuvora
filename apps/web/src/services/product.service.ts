import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';
import {
  Category,
  Product,
  ProductDetail,
  ProductFilters,
} from '../types/product.types';
import { Meta } from '../types/api.types';

export interface ProductListResponse {
  products: Product[];
  meta: Meta;
}

export const productService = {
  getProducts: async (
    filters: ProductFilters = {},
  ): Promise<ProductListResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const res = await api.get<ApiResponse<ProductListResponse>>(
      `/products?${params.toString()}`,
    );
    return res.data.data;
  },

  getProduct: async (slug: string): Promise<ProductDetail> => {
    const res = await api.get<ApiResponse<ProductDetail>>(
      `/products/${slug}`,
    );
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  getCategory: async (slug: string): Promise<Category> => {
    const res = await api.get<ApiResponse<Category>>(
      `/categories/${slug}`,
    );
    return res.data.data;
  },
};
