'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, ClipboardList, CreditCard, CheckCircle } from 'lucide-react';
import { useCheckout } from '@/hooks/use-checkout';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { AddressStep } from '@/components/checkout/address-step';
import { ReviewStep } from '@/components/checkout/review-step';
import { PaymentStep } from '@/components/checkout/payment-step';
import { ConfirmationStep } from '@/components/checkout/confirmation-step';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'review', label: 'Review', icon: ClipboardList },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Done', icon: CheckCircle },
] as const;

export function CheckoutContent() {
  const router = useRouter();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const {
    state,
    isLoading,
    setPromo,
    clearPromo,
    proceedToReview,
    proceedToPayment,
    onPaymentSuccess,
    setStep,
    setAddress,
  } = useCheckout();

  // Redirect if cart empty or not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (items.length === 0 && state.step !== 'confirmation') {
      router.push(ROUTES.CART);
    }
  }, [isAuthenticated, items.length, state.step, router]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === state.step);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
              Checkout
            </h1>
          </div>

          {/* Step indicator */}
          {state.step !== 'confirmation' && (
            <div className="flex items-center gap-2">
              {STEPS.filter((s) => s.id !== 'confirmation').map(
                (step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isActive = step.id === state.step;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                          isActive
                            ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                            : isCompleted
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{step.label}</span>
                      </div>
                      {index < STEPS.length - 2 && (
                        <div
                          className={cn(
                            'h-px w-8 transition-all',
                            isCompleted ? 'bg-green-400' : 'bg-border',
                          )}
                        />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
{state.step === 'address' && (
  <AddressStep
    selectedAddress={state.selectedAddress}
    onSelect={setAddress}
    onNext={() =>
      state.selectedAddress &&
      proceedToReview(state.selectedAddress)
    }
  />
)}

              {state.step === 'review' && state.selectedAddress && (
                <ReviewStep
                  selectedAddress={state.selectedAddress}
                  promoCode={state.promoCode}
                  promoDiscount={state.promoDiscount}
                  promoDiscountType={state.promoDiscountType}
                  onPromoApply={setPromo}
                  onPromoClear={clearPromo}
                  onNext={proceedToPayment}
                  onBack={() => setStep('address')}
                  isLoading={isLoading}
                />
              )}

              {state.step === 'payment' &&
                state.clientSecret &&
                state.breakdown && (
                  <PaymentStep
                    clientSecret={state.clientSecret}
                    total={state.breakdown.total}
                    onSuccess={onPaymentSuccess}
                    onBack={() => setStep('review')}
                  />
                )}

              {state.step === 'confirmation' && state.orderId && (
                <ConfirmationStep orderId={state.orderId} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
