'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, ChevronLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { CONFIG } from '@/constants/config';

const stripePromise = loadStripe(CONFIG.STRIPE_PK);

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  total: number;
}

function PaymentForm({ onSuccess, onBack, total }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-playfair font-bold text-navy dark:text-white">
        Payment
      </h2>

      {/* Secure badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 text-green-600" />
        <span>Your payment is secured by Stripe</span>
      </div>

      {/* Stripe Payment Element */}
      <div className="p-4 border border-border rounded-xl">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between font-bold text-navy dark:text-white p-4 bg-muted/30 rounded-xl">
        <span>Total to pay</span>
        <span className="text-lg">{formatPrice(total)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay {formatPrice(total)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface PaymentStepProps {
  clientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}

export function PaymentStep({
  clientSecret,
  total,
  onSuccess,
  onBack,
}: PaymentStepProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1B2D4F',
            colorBackground: '#ffffff',
            colorText: '#1B2D4F',
            colorDanger: '#DC2626',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm onSuccess={onSuccess} onBack={onBack} total={total} />
    </Elements>
  );
}
