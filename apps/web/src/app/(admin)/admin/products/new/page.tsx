import { ProductFormContent } from '@/components/admin/products/product-form-content';
import { Suspense } from 'react';

export const metadata = {
  title: 'Add Product | Admin',
};

export default function NewProductPage() {
  return (
    <Suspense fallback={null}>
      <ProductFormContent />
    </Suspense>
  );
}
