import api from '../lib/axios';
import { ApiResponse, Meta } from '../types/api.types';
import { Product } from '../types/product.types';

export interface WishlistItem {
  id: string;
  createdAt: string;
  product: Pick<
    Product,
    'id' | 'name' | 'slug' | 'price' | 'originalPrice' | 'isActive' | 'avgRating'
  > & {
    primaryImage: string | null;
    totalStock: number;
  };
}

export interface WishlistResponse {
  items: WishlistItem[];
  meta: Meta;
}

export const wishlistService = {
  getWishlist: async (page = 1, limit = 20): Promise<WishlistResponse> => {
    const res = await api.get<ApiResponse<WishlistResponse>>(
      `/wishlist?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  addToWishlist: async (productId: string): Promise<WishlistItem> => {
    const res = await api.post<ApiResponse<WishlistItem>>('/wishlist', {
      productId,
    });
    return res.data.data;
  },

  removeFromWishlist: async (productId: string): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },

  moveToCart: async (
    productId: string,
    data: { variantId?: string; quantity?: number },
  ): Promise<{ cartItemId: string }> => {
    const res = await api.post<ApiResponse<{ cartItemId: string }>>(
      `/wishlist/${productId}/move-to-cart`,
      data,
    );
    return res.data.data;
  },
};
