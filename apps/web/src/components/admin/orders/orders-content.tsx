'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

interface UpdateStatusModalProps {
  orderId: string;
  currentStatus: string;
  onClose: () => void;
}

function UpdateStatusModal({ orderId, currentStatus, onClose }: UpdateStatusModalProps) {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: () =>
      adminService.updateOrderStatus(
        orderId,
        newStatus,
        trackingNumber || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
      onClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    },
  });

  const validNextStatuses = VALID_TRANSITIONS[currentStatus] ?? [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair">Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <Badge className={cn('border-0', STATUS_COLORS[currentStatus])}>
              {currentStatus}
            </Badge>
          </div>

          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {validNextStatuses.map((status) => (
                <SelectItem key={status} value={status} className="cursor-pointer">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {newStatus === 'SHIPPED' && (
            <Input
              placeholder="Tracking number (optional)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
              disabled={!newStatus || isPending}
              onClick={() => updateStatus()}
            >
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminOrdersContent() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { search: debouncedSearch, status, page }],
    queryFn: () =>
      adminService.getAllOrders({
        page,
        limit: 20,
        status: status === 'ALL' ? undefined : status,
        search: debouncedSearch || undefined,
      }),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-gold" />
        <div>
          <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ?? 0} total orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Order
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                Customer
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Total
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Date
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4" colSpan={6}>
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : !data?.orders || data.orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders found</p>
                </td>
              </tr>
            ) : (
              data.orders.map((order: {
                id: string;
                status: string;
                total: number;
                itemCount: number;
                createdAt: string;
                customer: { name: string; email: string; avatar: string | null };
              }, index: number) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="text-sm font-mono font-medium">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.itemCount} items
                    </p>
                  </td>

                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={order.customer?.avatar ?? ''} />
                        <AvatarFallback className="bg-navy text-white text-xs">
                          {order.customer?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {order.customer?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-sm font-medium">
                      {formatPrice(order.total)}
                    </span>
                  </td>

                  <td className="p-4">
                    <Badge
                      className={cn('border-0', STATUS_COLORS[order.status])}
                    >
                      {order.status}
                    </Badge>
                  </td>

                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          setUpdatingOrderId(order.id);
                          setUpdatingOrderStatus(order.status);
                        }}
                        disabled={
                          VALID_TRANSITIONS[order.status]?.length === 0
                        }
                      >
                        Update Status
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.meta.totalPages}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updatingOrderId && (
        <UpdateStatusModal
          orderId={updatingOrderId}
          currentStatus={updatingOrderStatus}
          onClose={() => {
            setUpdatingOrderId(null);
            setUpdatingOrderStatus('');
          }}
        />
      )}
    </div>
  );
}
