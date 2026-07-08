'use client';

import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { cn, timeAgo } from '@/lib/utils';

import Badge from './badge';
import { NOTIFICATION_ICONS } from './constants/notification-icons';
import useNotification from './hooks/useNotification';




export function NotificationDropdown({ iconColor }: { iconColor: string }) {

  const { isOpen, setIsOpen, unreadCount, notifications, markAllRead, handleNotificationClick, isAuthenticated } = useNotification();

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell trigger */}
      <Button
        variant="ghost"
        size="icon"
        className={`relative cursor-pointer ${iconColor}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Badge count={unreadCount} />
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown panel */}
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-[-80px] md:right-0 top-12 w-70 md:w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="h-5 px-2 rounded-full bg-[#B58B45]/15 text-[10px] font-bold text-[#B58B45] flex items-center justify-center">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 text-xs text-[#B58B45] hover:text-[#B58B45]/80 transition-colors cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const IconComponent =
                      NOTIFICATION_ICONS[notification.type] ??
                      NOTIFICATION_ICONS.DEFAULT;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer',
                          !notification.isRead && 'bg-[#B58B45]/5',
                        )}
                      >
                        {/* Icon */}
                        <div className="h-8 w-8 rounded-full bg-[#B58B45]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <IconComponent className="h-4 w-4 text-[#B58B45]" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'text-sm line-clamp-1 text-foreground',
                              !notification.isRead ? 'font-semibold' : 'font-medium',
                            )}>
                              {notification.title}
                            </p>
                            {'createdAt' in notification && (
                              <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                                {timeAgo(notification.createdAt as string)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.body}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-[#B58B45] shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <Link
                  href={ROUTES.NOTIFICATIONS}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-[#B58B45] hover:text-[#B58B45]/80 transition-colors block text-center font-medium"
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
