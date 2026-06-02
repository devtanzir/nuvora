import { Suspense } from 'react';
import { AdminOrdersContent } from '@/components/admin/orders/orders-content';

export const metadata = {
  title: 'Orders | Admin',
};

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersContent />
    </Suspense>
  );
}
