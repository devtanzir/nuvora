import { NotificationsContent } from '@/components/product/notifications-content';
import { Suspense } from 'react';

export const metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsContent />
    </Suspense>
  );
}
