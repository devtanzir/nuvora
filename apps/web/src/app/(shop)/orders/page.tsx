import { Suspense } from 'react';
import { OrdersContent } from '@/components/orders/orders-content';

export const metadata = {
  title: 'My Orders',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  );
}
