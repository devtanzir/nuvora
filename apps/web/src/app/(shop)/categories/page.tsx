import { Suspense } from 'react';
import {CategoriesContent} from '@/components/categories/categories-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | Nuvora',
  description: 'Explore curated categories at Nuvora.',
};

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesContent />
    </Suspense>
  );
}
