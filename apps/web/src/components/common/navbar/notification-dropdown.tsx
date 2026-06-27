// apps/web/src/components/common/NotificationDropdown.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. import router
import { Bell, Check, Package, ShoppingCart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import getErrorMessage from '@/lib/error';
import { toast } from 'sonner';

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  ORDER_PLACED: ShoppingCart,
  ORDER_STATUS_UPDATE: ShoppingCart,
  REFUND_PROCESSED: ShoppingCart,
  REFUND_REQUESTED: ShoppingCart,
  BACK_IN_STOCK: Package,
  WELCOME: Bell,
  PASSWORD_RESET: Bell,
  DEFAULT: Package,
};

export function NotificationDropdown() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // 2. inside component

  const { data } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(),
    queryFn: () => userService.getNotifications({ limit: 10 }),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: userService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to mark as read'));
    },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: userService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS() });
    },
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  // 3. helper to extract order id from notification body
  const extractOrderId = (body: string): string | null => {
    const match = body.match(/cmq[a-z0-9]+/i); // cuid pattern
    return match ? match[0] : null;
  };

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    // mark as read
    if (!notification.isRead) {
      markRead(notification.id);
    }

    // close dropdown
    setIsOpen(false);

    // navigate based on type
    const orderId = extractOrderId(notification.body);

    if (
      (notification.type === 'ORDER_PLACED' ||
        notification.type === 'ORDER_STATUS_UPDATE' ||
        notification.type === 'REFUND_REQUESTED' ||
        notification.type === 'REFUND_PROCESSED') &&
      orderId
    ) {
      router.push(ROUTES.ORDER(orderId));
    } else {
      router.push(ROUTES.ORDERS); // fallback
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-navy dark:text-white">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-gold hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const IconComponent = NOTIFICATION_ICONS[notification.type] ?? NOTIFICATION_ICONS.DEFAULT;

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-0',
                          !notification.isRead && 'bg-gold/5',
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="h-8 w-8 rounded-full bg-navy/10 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <IconComponent className="h-4 w-4 text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy dark:text-white line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.body}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-3 border-t border-border">
                <Link
                  href={ROUTES.NOTIFICATIONS}
                  className="text-xs text-gold hover:underline block text-center"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
