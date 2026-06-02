'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Package, MapPin, Tag, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '@/services/order.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/order.types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

interface AdminOrderDetailContentProps {
  orderId: string;
}

export function AdminOrderDetailContent({ orderId }: AdminOrderDetailContentProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORDER(orderId),
    queryFn: () => orderService.getOrder(orderId),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.ADMIN_ORDERS}>Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="cursor-pointer"
        >
          <Link href={ROUTES.ADMIN_ORDERS}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={cn('border-0 text-sm', STATUS_COLORS[order.status])}>
          {order.status}
        </Badge>
      </div>

      {/* Order Items */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gold" />
          <p className="font-medium text-navy dark:text-white">
            Items ({order.items.length})
          </p>
        </div>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                {item.primaryImage ? (
                  <Image
                    src={item.primaryImage}
                    alt={item.productName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">
                    {item.variantName}: {item.variantValue}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                  <p className="text-sm font-bold text-navy dark:text-white">
                    {formatPrice(item.itemTotal)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <p className="font-medium text-navy dark:text-white">Order Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {order.promoCode?.code}
              </span>
              <span className="text-green-600">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-navy dark:text-white">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" />
          <p className="font-medium text-navy dark:text-white">
            Delivery Address
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{order.address.fullName}</p>
          <p className="text-sm text-muted-foreground">{order.address.phone}</p>
          <p className="text-sm text-muted-foreground">
            {order.address.street}, {order.address.city},{' '}
            {order.address.district} {order.address.postalCode}
          </p>
        </div>
      </div>
    </div>
  );
}
