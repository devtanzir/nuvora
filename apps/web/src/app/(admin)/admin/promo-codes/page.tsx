import { Suspense } from 'react';
import { AdminPromoCodesContent } from '@/components/admin/promo-codes/promo-codes-content';

export const metadata = {
  title: 'Promo Codes | Admin',
};

export default function AdminPromoCodesPage() {
  return (
    <Suspense fallback={null}>
      <AdminPromoCodesContent />
    </Suspense>
  );
}
