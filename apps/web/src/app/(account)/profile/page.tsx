import { Suspense } from 'react';
import { ProfileContent } from '@/components/profile/profile-content';

export const metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
