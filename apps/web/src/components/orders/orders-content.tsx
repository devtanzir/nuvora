'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orderService } from '@/services/order.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { OrderStatus } from '@/types/order.types';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function OrdersContent() {
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORDERS({ status, page }),
    queryFn: () =>
      orderService.getOrders({
        page,
        limit: 10,
        status: status === 'ALL' ? undefined : status,
      }),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-gold" />
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase">
                Purchase History
              </p>
              <h1 className="text-3xl font-playfair font-bold text-navy dark:text-white">
                My Orders
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {data?.meta.total ?? 0} orders
          </p>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as OrderStatus | 'ALL')}
          >
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !data || data.orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-playfair font-bold text-navy dark:text-white">
                No orders yet
              </p>
              <p className="text-muted-foreground">
                Your order history will appear here
              </p>
            </div>
            <Button
              className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
              asChild
            >
              <Link href={ROUTES.PRODUCTS}>
                Start Shopping
                <ShoppingBag className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={ROUTES.ORDER(order.id)}>
                  <div className="p-5 rounded-xl border border-border hover:border-gold/50 hover:shadow-md transition-all duration-200 bg-card">
                    {/* Order header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-muted-foreground font-mono">
                            #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <Badge
                            className={cn(
                              'text-xs font-medium border-0',
                              STATUS_COLORS[order.status],
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-navy dark:text-white">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.itemCount}{' '}
                          {order.itemCount === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="h-12 w-12 rounded-lg overflow-hidden border-2 border-background bg-muted"
                          >
                            {item.primaryImage ? (
                              <Image
                                src={item.primaryImage}
                                alt={item.productName ?? ''}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="h-12 w-12 rounded-lg border-2 border-background bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground font-medium">
                              +{order.items.length - 3}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {order.items
                            .map((i) => i.productName)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
