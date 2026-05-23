import { Suspense } from 'react';
import { CheckoutContent } from '@/components/checkout/checkout-content';

export const metadata = {
  title: 'Checkout',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
