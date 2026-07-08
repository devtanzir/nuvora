import { Bell, Package, ShoppingCart } from 'lucide-react';
export const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  ORDER_PLACED: ShoppingCart,
  ORDER_STATUS_UPDATE: ShoppingCart,
  REFUND_PROCESSED: ShoppingCart,
  REFUND_REQUESTED: ShoppingCart,
  BACK_IN_STOCK: Package,
  WELCOME: Bell,
  PASSWORD_RESET: Bell,
  DEFAULT: Package,
};
