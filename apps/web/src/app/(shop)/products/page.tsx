import { ProductsContent } from '@/components/product/products-content';
import { Suspense } from 'react';

export const metadata = {
  title: 'Products',
  description: 'Browse our premium collection of products',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
