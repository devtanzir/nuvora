import { Suspense } from 'react';
import {CategoriesContent} from '@/components/categories/categories-content';

export const metadata = {
  title: 'Categories',
};

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesContent />
    </Suspense>
  );
}
