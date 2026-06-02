import { Suspense } from 'react';
import CartContent from '@/components/cart/cart-content';

export const metadata = {
  title: 'Cart',
};

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartContent />
    </Suspense>
  );
}
