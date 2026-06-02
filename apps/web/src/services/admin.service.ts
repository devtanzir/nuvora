import { Category, ProductDetail } from '@/types/product.types';
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

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  primaryImage: string | null;
  reviewCount: number;
  avgRating: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
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
    const res = await api.get<
      ApiResponse<{ products: LowStockProduct[]; meta: { total: number } }>
    >(`/admin/dashboard/low-stock?threshold=${threshold}&page=1&limit=10`);
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

    const res = await api.get<
      ApiResponse<{
        users: AdminUser[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>
    >(`/admin/users?${query.toString()}`);
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

    const res = await api.get(`/orders/admin/all?${query.toString()}`);
    return res.data.data;
  },

  updateOrderStatus: async (
    id: string,
    status: string,
    trackingNumber?: string,
  ) => {
    const res = await api.patch(`/orders/admin/${id}/status`, {
      status,
      trackingNumber,
    });
    return res.data.data;
  },
getProducts: async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);

  const res = await api.get<ApiResponse<{
    products: AdminProduct[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>>(
    `/products/admin/all?${query.toString()}`,
  );
  return res.data.data;
},

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  toggleProductStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch(`/products/${id}`, { isActive });
    return res.data.data;
  },
getProduct: async (slug: string): Promise<ProductDetail> => {
  const res = await api.get<ApiResponse<ProductDetail>>(
    `/products/${slug}`,
  );
  return res.data.data;
},

createProduct: async (data: {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  images: { url: string; order: number; isPrimary: boolean }[];
  variants?: { name: string; value: string; stock: number; price?: number }[];
}) => {
  const res = await api.post<ApiResponse<{ id: string; name: string; slug: string }>>(
    '/products',
    data,
  );
  return res.data.data;
},

updateProduct: async (slug: string, data: {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  categoryId?: string;
  isActive?: boolean;
  images?: { url: string; order: number; isPrimary: boolean }[];
}) => {
  const productRes = await api.get<ApiResponse<ProductDetail>>(
    `/products/${slug}`,
  );
  const id = productRes.data.data.id;

  const res = await api.patch<ApiResponse<{ id: string }>>(
    `/products/${id}`,
    data,
  );
  return res.data.data;
},
getCategories: async () => {
  const res = await api.get<ApiResponse<Category[]>>('/categories');
  return res.data.data;
},

createCategory: async (data: {
  name: string;
  description?: string;
  image?: string;
}) => {
  const res = await api.post<ApiResponse<Category>>('/categories', data);
  return res.data.data;
},

updateCategory: async (id: string, data: {
  name?: string;
  description?: string;
  image?: string;
}) => {
  const res = await api.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    data,
  );
  return res.data.data;
},

deleteCategory: async (id: string) => {
  await api.delete(`/categories/${id}`);
},
getPromoCodes: async (params?: { page?: number; limit?: number; isActive?: boolean }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));

  const res = await api.get<ApiResponse<{
    promoCodes: PromoCode[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>>(`/promo-codes/admin?${query.toString()}`);
  return res.data.data;
},

createPromoCode: async (data: {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  usageLimit?: number;
  isActive: boolean;
  expiresAt?: string;
}) => {
  const res = await api.post<ApiResponse<PromoCode>>(
    '/promo-codes/admin',
    data,
  );
  return res.data.data;
},

togglePromoCode: async (id: string) => {
  const res = await api.patch<ApiResponse<PromoCode>>(
    `/promo-codes/admin/${id}/toggle`,
  );
  return res.data.data;
},

deletePromoCode: async (id: string) => {
  await api.delete(`/promo-codes/admin/${id}`);
},
getBanners: async () => {
  const res = await api.get<ApiResponse<Banner[]>>('/banners/admin');
  return res.data.data;
},

createBanner: async (data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  isActive: boolean;
}) => {
  const res = await api.post<ApiResponse<Banner>>(
    '/banners/admin',
    data,
  );
  return res.data.data;
},

updateBanner: async (id: string, data: {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}) => {
  const res = await api.patch<ApiResponse<Banner>>(
    `/banners/admin/${id}`,
    data,
  );
  return res.data.data;
},

deleteBanner: async (id: string) => {
  await api.delete(`/banners/admin/${id}`);
},
addVariant: async (
  productId: string,
  data: { name: string; value: string; stock: number; price?: number },
) => {
  const res = await api.post<ApiResponse<{ id: string; name: string; value: string; stock: number; price: number | null }>>(
    `/products/${productId}/variants`,
    data,
  );
  return res.data.data;
},

updateVariant: async (
  productId: string,
  variantId: string,
  data: { stock?: number; price?: number },
) => {
  const res = await api.patch<ApiResponse<{ id: string }>>(
    `/products/${productId}/variants/${variantId}`,
    data,
  );
  return res.data.data;
},

deleteVariant: async (productId: string, variantId: string) => {
  await api.delete(`/products/${productId}/variants/${variantId}`);
},
};
