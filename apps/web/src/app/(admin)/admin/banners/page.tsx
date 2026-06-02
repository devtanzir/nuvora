import { AdminBannersContent } from '@/components/admin/banners/banners-content';
import { Suspense } from 'react';

export const metadata = {
  title: 'Banners | Admin',
};

export default function AdminBannersPage() {
  return (
    <Suspense fallback={null}>
      <AdminBannersContent />
    </Suspense>
  );
}
