export const CONFIG = {
  APP_NAME: 'Nuvora',
  APP_DESCRIPTION: 'Discover premium fashion at Nuvora',
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,

  // Cart
  MAX_CART_QUANTITY: 10,

  // Address
  MAX_ADDRESSES: 5,

  // Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
