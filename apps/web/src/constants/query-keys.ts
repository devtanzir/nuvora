export const QUERY_KEYS = {
  // Auth
  ME: ['auth', 'me'] as const,

  // Products
  PRODUCTS: (filters?: object) =>
    filters ? ['products', filters] : ['products'],
  PRODUCT: (slug: string) => ['products', slug] as const,

  // Categories
  CATEGORIES: ['categories'] as const,
  CATEGORY: (slug: string) => ['categories', slug] as const,

  // Cart
  CART: ['cart'] as const,

  // Wishlist
  WISHLIST: (page?: number) =>
    page ? ['wishlist', page] : ['wishlist'],

  // Orders
  ORDERS: (filters?: object) =>
    filters ? ['orders', filters] : ['orders'],
  ORDER: (id: string) => ['orders', id] as const,

  // Reviews
  REVIEWS: (productId: string, filters?: object) =>
    filters
      ? ['reviews', productId, filters]
      : ['reviews', productId],
  REVIEW_SUMMARY: (productId: string) =>
    ['reviews', productId, 'summary'] as const,
  MY_REVIEWS: (page?: number) =>
    page ? ['my-reviews', page] : ['my-reviews'],

  // Notifications
  NOTIFICATIONS: (filters?: object) =>
    filters ? ['notifications', filters] : ['notifications'],

  // Admin
  ADMIN_OVERVIEW: ['admin', 'overview'] as const,
  ADMIN_REVENUE: (period?: string) =>
    period ? ['admin', 'revenue', period] : ['admin', 'revenue'],
  ADMIN_ORDERS: (filters?: object) =>
    filters ? ['admin', 'orders', filters] : ['admin', 'orders'],
  ADMIN_USERS: (filters?: object) =>
    filters ? ['admin', 'users', filters] : ['admin', 'users'],
  ADMIN_LOW_STOCK: ['admin', 'low-stock'] as const,
  ADMIN_BEST_SELLERS: (period?: string) =>
    period
      ? ['admin', 'best-sellers', period]
      : ['admin', 'best-sellers'],
} as const;
