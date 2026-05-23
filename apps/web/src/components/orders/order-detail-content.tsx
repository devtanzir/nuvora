'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  MapPin,
  ChevronLeft,
  ShoppingBag,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '@/services/order.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { OrderStatus } from '@/types/order.types';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const STATUS_STEPS: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

interface OrderDetailContentProps {
  orderId: string;
}

export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORDER(orderId),
    queryFn: () => orderService.getOrder(orderId),
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: () => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(orderId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS() });
      toast.success('Order cancelled successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to cancel order'));
    },
  });

  const { mutate: requestRefund, isPending: isRefunding } = useMutation({
    mutationFn: () =>
      orderService.requestRefund(orderId, 'Customer requested refund'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(orderId) });
      toast.success('Refund request submitted');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to request refund'));
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.ORDERS}>Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancellable = order.status === 'PENDING';
  const isRefundable = order.status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={ROUTES.ORDERS}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge
              className={cn(
                'text-sm font-medium border-0 px-3 py-1',
                STATUS_COLORS[order.status],
              )}
            >
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Order Progress */}
        {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
          <div className="p-5 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium text-navy dark:text-white mb-4">
              Order Progress
            </p>
            <div className="flex items-center gap-2">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full transition-all',
                          isCompleted
                            ? 'bg-gold'
                            : 'bg-muted border-2 border-border',
                          isActive && 'ring-2 ring-gold ring-offset-2',
                        )}
                      />
                      <p
                        className={cn(
                          'text-[10px] text-center',
                          isCompleted
                            ? 'text-gold font-medium'
                            : 'text-muted-foreground',
                        )}
                      >
                        {step.charAt(0) + step.slice(1).toLowerCase()}
                      </p>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'h-px flex-1 mb-4 transition-all',
                          index < currentStepIndex
                            ? 'bg-gold'
                            : 'bg-border',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                  <p className="text-sm font-medium line-clamp-1">
                    {item.productName}
                  </p>
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
          <p className="font-medium text-navy dark:text-white">
            Order Summary
          </p>
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
                <span className="text-green-600">
                  -{formatPrice(order.discount)}
                </span>
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

          {order.stripeReceiptUrl && (
            <a
              href={order.stripeReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gold hover:underline mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              View Payment Receipt
            </a>
          )}
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
            <p className="text-sm text-muted-foreground">
              {order.address.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.address.street}, {order.address.city},{' '}
              {order.address.district} {order.address.postalCode}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isCancellable && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive cursor-pointer"
              onClick={() => cancelOrder()}
              disabled={isCancelling}
            >
              Cancel Order
            </Button>
          )}
          {isRefundable && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => requestRefund()}
              disabled={isRefunding}
            >
              Request Refund
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
