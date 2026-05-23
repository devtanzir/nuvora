import { Suspense } from 'react';
import { OrderDetailContent } from '@/components/orders/order-detail-content';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <OrderDetailContent orderId={id} />
    </Suspense>
  );
}
