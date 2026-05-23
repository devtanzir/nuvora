import { Suspense } from 'react';
import { DashboardContent } from '@/components/admin/dashboard-content';

export const metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
