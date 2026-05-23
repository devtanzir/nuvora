import api from '../lib/axios';
import { ApiResponse, Meta } from '../types/api.types';
import { Order, OrderDetail, OrderStatus } from '../types/order.types';

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
  breakdown: {
    subtotal: number;
    discount: number;
    total: number;
  };
}

export interface PromoValidateResponse {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
}

export interface OrderListResponse {
  orders: Order[];
  meta: Meta;
}

export const orderService = {
  createPaymentIntent: async (data: {
    addressId: string;
    promoCode?: string;
  }): Promise<PaymentIntentResponse> => {
    const res = await api.post<ApiResponse<PaymentIntentResponse>>(
      '/orders/create-payment-intent',
      data,
    );
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
  }): Promise<OrderListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const res = await api.get<ApiResponse<OrderListResponse>>(
      `/orders?${query.toString()}`,
    );
    return res.data.data;
  },

  getOrder: async (id: string): Promise<OrderDetail> => {
    const res = await api.get<ApiResponse<OrderDetail>>(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: string): Promise<void> => {
    await api.post(`/orders/${id}/cancel`);
  },

  requestRefund: async (id: string, reason: string): Promise<void> => {
    await api.post(`/orders/${id}/refund`, { reason });
  },

  validatePromo: async (
    code: string,
    subtotal: number,
  ): Promise<PromoValidateResponse> => {
    const res = await api.post<ApiResponse<PromoValidateResponse>>(
      '/promo-codes/validate',
      { code, subtotal },
    );
    return res.data.data;
  },
};
