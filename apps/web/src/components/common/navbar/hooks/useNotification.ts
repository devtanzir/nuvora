import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import getErrorMessage from '@/lib/error';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const useNotification = () => {
   const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // ── Queries & mutations ──────────────────────────────────

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

  // ── Helpers ───────────────────────────────────────────────────

  const extractOrderId = (body: string): string | null => {
    const match = body.match(/cmq[a-z0-9]+/i);
    return match ? match[0] : null;
  };

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    if (!notification.isRead) markRead(notification.id);
    setIsOpen(false);

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
      router.push(ROUTES.ORDERS);
    }
  };
  return {
    isOpen,
    setIsOpen,
    unreadCount,
    notifications,
    markAllRead,
    isAuthenticated,
    handleNotificationClick
  }
};

export default useNotification;
