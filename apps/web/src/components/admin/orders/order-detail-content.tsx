'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  MapPin,
  ChevronLeft,
  ShoppingBag,
  Tag,
  ExternalLink,
  Download,
  BadgeCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminService } from '@/services/admin.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';
import api from '@/lib/axios';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

interface AdminOrderDetailContentProps {
  orderId: string;
}

export function AdminOrderDetailContent({ orderId }: AdminOrderDetailContentProps) {
  const queryClient = useQueryClient();
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  // Fetch using admin-specific endpoint (no ownership check)
  const { data: order, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORDER(orderId),
    queryFn: () => adminService.getOrder(orderId),
  });

  // Process refund (approve)
  const { mutate: processRefund, isPending: isProcessingRefund } = useMutation({
    mutationFn: () =>
      adminService.processRefund(orderId, { action: 'APPROVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(orderId) });
      toast.success('Refund processed successfully');
      setIsRefundDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to process refund'));
    },
  });

  // Reject refund
  const { mutate: rejectRefund, isPending: isRejecting } = useMutation({
    mutationFn: () =>
      adminService.processRefund(orderId, { action: 'REJECT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(orderId) });
      toast.success('Refund request rejected');
      setIsRefundDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to reject refund'));
    },
  });

  // Download invoice
  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

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

  const hasRefundRequest = order.status === 'DELIVERED' && !!order.refundRequest;
  const refundStatus = order.refundRequest?.status;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="cursor-pointer">
          <Link href={ROUTES.ADMIN_ORDERS}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Order #{order.orderNumber ?? order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={cn('text-sm font-medium border-0 px-3 py-1', STATUS_COLORS[order.status])}>
          {order.status}
        </Badge>
      </div>

      {/* Refund Request Summary (if present) */}
      {order.refundRequest && (
        <div className="p-5 rounded-xl border border-warning/30 bg-warning/5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="font-medium text-navy dark:text-white">
              Refund Request – {refundStatus}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Reason: {order.refundRequest.reason}
          </p>
          <p className="text-xs text-muted-foreground">
            Requested on {formatDate(order.refundRequest.createdAt)}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gold" />
          <p className="font-medium text-navy dark:text-white">Items ({order.items.length})</p>
        </div>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                {item.primaryImage ? (
                  <Image src={item.primaryImage} alt={item.productName} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}: {item.variantValue}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  <p className="text-sm font-bold text-navy dark:text-white">{formatPrice(item.itemTotal)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
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
        {order.stripeReceiptUrl && (
          <a href={order.stripeReceiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gold hover:underline mt-2">
            <ExternalLink className="h-3 w-3" />
            View Payment Receipt
          </a>
        )}
      </div>

      {/* Address */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" />
          <p className="font-medium text-navy dark:text-white">Delivery Address</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{order.address.fullName}</p>
          <p className="text-sm text-muted-foreground">{order.address.phone}</p>
          <p className="text-sm text-muted-foreground">{order.address.street}, {order.address.city}, {order.address.district} {order.address.postalCode}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleDownloadInvoice}>
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>

        {hasRefundRequest && refundStatus === 'PENDING' && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setIsRefundDialogOpen(true)}
          >
            <BadgeCheck className="mr-2 h-4 w-4" />
            Process Refund
          </Button>
        )}
      </div>

      {/* Refund Dialog */}
      <AlertDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund Request</AlertDialogTitle>
            <AlertDialogDescription>
              Approve to refund the payment and mark order as refunded. Reject to deny the request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              onClick={() => rejectRefund()}
              disabled={isRejecting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
              onClick={() => processRefund()}
              disabled={isProcessingRefund}
            >
              <BadgeCheck className="mr-2 h-4 w-4" />
              Approve Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
