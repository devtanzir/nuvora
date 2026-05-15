import api from '../lib/axios';
import { ApiResponse, Meta } from '../types/api.types';
import { Order, OrderDetail, OrderStatus } from '../types/order.types';

export const orderService = {
  createPaymentIntent: async (data: {
    addressId: string;
    promoCode?: string;
  }) => {
    const res = await api.post<ApiResponse<{
      clientSecret: string;
      amount: number;
      currency: string;
      breakdown: {
        subtotal: number;
        discount: number;
        total: number;
      };
    }>>('/orders/create-payment-intent', data);
    return res.data.data;
  },

  createOrder: async (data: {
    addressId: string;
    promoCode?: string;
    stripePaymentId: string;
  }): Promise<Order> => {
    const res = await api.post<ApiResponse<Order>>('/orders', data);
    return res.data.data;
  },

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const res = await api.get<ApiResponse<{ orders: Order[]; meta: Meta }>>(`/orders?${query.toString()}`);
    return res.data.data;
  },

  getOrder: async (id: string): Promise<OrderDetail> => {
    const res = await api.get<ApiResponse<OrderDetail>>(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: string): Promise<void> => {
    await api.post(`/orders/${id}/cancel`);
  },

  requestRefund: async (id: string, reason: string) => {
    const res = await api.post(`/orders/${id}/refund`, { reason });
    return res.data;
  },

  validatePromo: async (code: string, subtotal: number) => {
    const res = await api.post<ApiResponse<{
      code: string;
      discountType: string;
      discountValue: number;
      discountAmount: number;
      finalTotal: number;
    }>>('/promo-codes/validate', { code, subtotal });
    return res.data.data;
  },
};
