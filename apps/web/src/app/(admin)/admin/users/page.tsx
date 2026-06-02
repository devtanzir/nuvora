import { Suspense } from 'react';
import { AdminUsersContent } from '@/components/admin/users/users-content';

export const metadata = {
  title: 'Users | Admin',
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersContent />
    </Suspense>
  );
}
