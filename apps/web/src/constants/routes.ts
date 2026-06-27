export const ROUTES = {
  // Public
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/products/${slug}`,
  CATEGORIES: '/categories',
CATEGORY: (slug: string) => `/products?category=${slug}`,
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  AUTH_CALLBACK: '/auth/callback',

  // Protected
  CART: '/cart',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER: (id: string) => `/orders/${id}`,
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',
  NOTIFICATIONS: '/profile/notifications',
  REVIEWS: '/profile/reviews',

  // Admin
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/products/${id}`,
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER: (id: string) => `/admin/orders/${id}`,
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_PROMO_CODES: '/admin/promo-codes',
} as const;
