'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';

export function NotificationIcon() {
  const { isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(),
    queryFn: () => userService.getNotifications({ limit: 1, unread: true }),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href={ROUTES.NOTIFICATIONS}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Link>
    </Button>
  );
}
