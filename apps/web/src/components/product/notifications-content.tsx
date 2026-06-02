'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Package, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  ORDER_STATUS_UPDATE: ShoppingCart,
  REVIEW_REQUEST: Star,
  DEFAULT: Package,
};

export function NotificationsContent() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(),
    queryFn: () => userService.getNotifications({ limit: 50 }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: userService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS() });
      toast.success('All notifications marked as read');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-gold" />
              <div>
                <p className="text-gold text-sm font-medium tracking-widest uppercase">
                  Updates
                </p>
                <h1 className="text-3xl font-playfair font-bold text-navy dark:text-white">
                  Notifications
                </h1>
              </div>
            </div>
            {data && data.unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead()}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Bell className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="text-center">
              <p className="font-playfair font-bold text-xl text-navy dark:text-white">
                No notifications
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                You&apos;re all caught up!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.notifications.map((notification, index) => {
              const Icon =
                NOTIFICATION_ICONS[notification.title] ??
                NOTIFICATION_ICONS.DEFAULT;
              const isUnread = !notification.isRead;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-gold/30',
                    isUnread
                      ? 'border-gold/30 bg-gold/5'
                      : 'border-border bg-card',
                  )}
                  onClick={() => {
                    if (isUnread) markRead(notification.id);
                  }}
                >
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                      isUnread
                        ? 'bg-gold/20 text-gold'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isUnread
                          ? 'text-navy dark:text-white'
                          : 'text-foreground',
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-2" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
