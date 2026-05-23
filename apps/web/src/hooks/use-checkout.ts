'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { orderService } from '@/services/order.service';
import { useClearCart } from '@/hooks/use-cart';
import { Address } from '@/types/order.types';

export type CheckoutStep = 'address' | 'review' | 'payment' | 'confirmation';

export interface CheckoutState {
  step: CheckoutStep;
  selectedAddress: Address | null;
  promoCode: string;
  promoDiscount: number;
  promoDiscountType: string;
  clientSecret: string | null;
  orderId: string | null;
  breakdown: {
    subtotal: number;
    discount: number;
    total: number;
  } | null;
}

export function useCheckout() {
  const { mutate: clearCart } = useClearCart();

  const [state, setState] = useState<CheckoutState>({
    step: 'address',
    selectedAddress: null,
    promoCode: '',
    promoDiscount: 0,
    promoDiscountType: '',
    clientSecret: null,
    orderId: null,
    breakdown: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const setStep = (step: CheckoutStep) =>
    setState((prev) => ({ ...prev, step }));

  const setAddress = (address: Address) =>
    setState((prev) => ({ ...prev, selectedAddress: address }));

  const setPromo = (
    code: string,
    discount: number,
    discountType: string,
  ) =>
    setState((prev) => ({
      ...prev,
      promoCode: code,
      promoDiscount: discount,
      promoDiscountType: discountType,
    }));

  const clearPromo = () =>
    setState((prev) => ({
      ...prev,
      promoCode: '',
      promoDiscount: 0,
      promoDiscountType: '',
    }));

  // Move from address to review
  const proceedToReview = (address: Address) => {
    setAddress(address);
    setStep('review');
  };

  // Move from review to payment — create payment intent
  const proceedToPayment = async () => {
    if (!state.selectedAddress?.id) return;

    setIsLoading(true);
    try {
      const res = await orderService.createPaymentIntent({
        addressId: state.selectedAddress.id,
        promoCode: state.promoCode || undefined,
      });

      setState((prev) => ({
        ...prev,
        clientSecret: res.clientSecret,
        breakdown: res.breakdown,
        step: 'payment',
      }));
    } catch {
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Called after Stripe payment success
  const onPaymentSuccess = (paymentIntentId: string) => {
    setState((prev) => ({
      ...prev,
      orderId: paymentIntentId,
      step: 'confirmation',
    }));
    clearCart();
  };

  return {
    state,
    isLoading,
    setStep,
    setAddress,
    setPromo,
    clearPromo,
    proceedToReview,
    proceedToPayment,
    onPaymentSuccess,
  };
}
