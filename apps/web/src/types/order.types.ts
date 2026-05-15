export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  primaryImage: string | null;
  variantName: string | null;
  variantValue: string | null;
  quantity: number;
  price: number;
  itemTotal: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  createdAt: string;
  items: Partial<OrderItem>[];
}

export interface OrderDetail extends Omit<Order, 'items'> {
  stripeReceiptUrl: string | null;
  trackingNumber: string | null;
  address: Omit<Address, 'id' | 'isDefault'>;
  promoCode: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
  } | null;
  items: OrderItem[];
}

export interface RefundRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
}
