import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';
import { Cart, CartItem } from '../types/cart.types';

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const res = await api.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  addItem: async (data: {
    productId: string;
    variantId?: string;
    quantity: number;
  }): Promise<CartItem> => {
    const res = await api.post<ApiResponse<CartItem>>('/cart/items', data);
    return res.data.data;
  },

  updateItem: async (itemId: string, quantity: number): Promise<CartItem> => {
    const res = await api.patch<ApiResponse<CartItem>>(
      `/cart/items/${itemId}`,
      { quantity },
    );
    return res.data.data;
  },

  removeItem: async (itemId: string): Promise<void> => {
    await api.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};
