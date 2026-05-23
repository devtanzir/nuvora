import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';

export interface DashboardOverview {
  totalRevenue: {
    value: number;
    changePercent: number;
    period: string;
  };
  totalOrders: {
    value: number;
    changePercent: number;
    period: string;
  };
  totalUsers: {
    value: number;
    changePercent: number;
    period: string;
  };
  totalProducts: {
    value: number;
    active: number;
    inactive: number;
  };
  pendingOrders: number;
  refundRequests: number;
}

export interface RevenueChart {
  period: string;
  chart: {
    label: string;
    revenue: number;
    orders: number;
  }[];
  totals: {
    revenue: number;
    orders: number;
  };
}

export interface RecentOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  primaryImage: string | null;
  variants: {
    id: string;
    name: string;
    value: string;
    stock: number;
  }[];
  totalStock: number;
}

export interface BestSeller {
  id: string;
  name: string;
  slug: string;
  primaryImage: string | null;
  price: number;
  totalSold: number;
  revenue: number;
  avgRating: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export const adminService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await api.get<ApiResponse<DashboardOverview>>(
      '/admin/dashboard/overview',
    );
    return res.data.data;
  },

  getRevenue: async (period = 'monthly'): Promise<RevenueChart> => {
    const res = await api.get<ApiResponse<RevenueChart>>(
      `/admin/dashboard/revenue?period=${period}`,
    );
    return res.data.data;
  },

  getRecentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    const res = await api.get<ApiResponse<RecentOrder[]>>(
      `/admin/dashboard/recent-orders?limit=${limit}`,
    );
    return res.data.data;
  },

  getLowStock: async (threshold = 10) => {
    const res = await api.get<ApiResponse<{ products: LowStockProduct[]; meta: { total: number } }>>(
      `/admin/dashboard/low-stock?threshold=${threshold}&page=1&limit=10`,
    );
    return res.data.data;
  },

  getBestSellers: async (period = '30d'): Promise<BestSeller[]> => {
    const res = await api.get<ApiResponse<BestSeller[]>>(
      `/admin/dashboard/best-sellers?limit=5&period=${period}`,
    );
    return res.data.data;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);

    const res = await api.get<ApiResponse<{ users: AdminUser[]; meta: { total: number; page: number; limit: number; totalPages: number } }>>(
      `/admin/users?${query.toString()}`,
    );
    return res.data.data;
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch<ApiResponse<{ id: string; isActive: boolean }>>(
      `/admin/users/${id}/status`,
      { isActive },
    );
    return res.data.data;
  },

  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await api.get(
      `/orders/admin/all?${query.toString()}`,
    );
    return res.data.data;
  },

  updateOrderStatus: async (
    id: string,
    status: string,
    trackingNumber?: string,
  ) => {
    const res = await api.patch(
      `/orders/admin/${id}/status`,
      { status, trackingNumber },
    );
    return res.data.data;
  },
};
