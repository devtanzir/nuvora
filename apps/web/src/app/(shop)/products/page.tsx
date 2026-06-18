import { ProductsContent } from '@/components/product/products-content';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Products | Nuvora',
  description: 'Browse our premium collection of fashion products.',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
