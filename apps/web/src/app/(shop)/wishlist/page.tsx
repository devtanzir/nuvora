import { Suspense } from 'react';
import { WishlistContent } from '@/components/wishlist/wishlist-content';

export const metadata = {
  title: 'Wishlist',
};

export default function WishlistPage() {
  return (
    <Suspense fallback={null}>
      <WishlistContent />
    </Suspense>
  );
}
