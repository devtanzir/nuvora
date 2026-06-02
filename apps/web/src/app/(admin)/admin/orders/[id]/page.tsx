import { Suspense } from 'react';
import { AdminOrderDetailContent } from '@/components/admin/orders/order-detail-content';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <AdminOrderDetailContent orderId={id} />
    </Suspense>
  );
}
