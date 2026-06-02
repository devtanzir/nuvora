import { Suspense } from 'react';
import { AdminProductsContent } from '@/components/admin/products/products-content';

export const metadata = {
  title: 'Products | Admin',
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProductsContent />
    </Suspense>
  );
}
