import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';
import { Meta } from '../types/api.types';
import { Product } from '../types/product.types';

export interface WishlistItem {
  id: string;
  createdAt: string;
  product: Pick<
    Product,
    'id' | 'name' | 'slug' | 'price' | 'originalPrice' | 'isActive' | 'avgRating'
  > & {
    primaryImage: string | null;
    stock: number;
  };
}

export const wishlistService = {
  getWishlist: async (page = 1, limit = 20) => {
    const res = await api.get<
      ApiResponse<{ items: WishlistItem[]; meta: Meta }>
    >(`/wishlist?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  addToWishlist: async (productId: string) => {
    const res = await api.post<ApiResponse<WishlistItem>>('/wishlist', { productId });
    return res.data.data;
  },

  removeFromWishlist: async (productId: string): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },

  moveToCart: async (
    productId: string,
    data: { variantId?: string; quantity?: number },
  ) => {
    const res = await api.post<ApiResponse<{ cartItemId: string }>>(
      `/wishlist/${productId}/move-to-cart`,
      data,
    );
    return res.data.data;
  },
};