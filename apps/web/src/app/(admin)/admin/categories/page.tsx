import { AdminCategoriesContent } from '@/components/admin/categories/categories-content';
import { Suspense } from 'react';

export const metadata = {
  title: 'Categories | Admin',
};

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={null}>
      <AdminCategoriesContent />
    </Suspense>
  );
}
