'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tag, X, Loader2, ShoppingBag, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { orderService } from '@/services/order.service';
import { Address } from '@/types/order.types';
import { useCartStore } from '@/store/cart.store';
import getErrorMessage from '@/lib/error';

interface ReviewStepProps {
  selectedAddress: Address;
  promoCode: string;
  promoDiscount: number;
  promoDiscountType: string;
  onPromoApply: (code: string, discount: number, discountType: string) => void;
  onPromoClear: () => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ReviewStep({
  selectedAddress,
  promoCode,
  promoDiscount,
  promoDiscountType,
  onPromoApply,
  onPromoClear,
  onNext,
  onBack,
  isLoading,
}: ReviewStepProps) {
  const { items, subtotal } = useCartStore();
  const [promoInput, setPromoInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;

    setIsValidating(true);
    try {
      const res = await orderService.validatePromo(promoInput.trim(), subtotal);
      onPromoApply(res.code, res.discountAmount, res.discountType);
      toast.success(
        `Promo code applied! You save ${formatPrice(res.discountAmount)}`,
      );
      setPromoInput('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid promo code'));
    } finally {
      setIsValidating(false);
    }
  };

  const discountedTotal = subtotal - promoDiscount;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-playfair font-bold text-navy dark:text-white">
        Review Order
      </h2>

      {/* Delivery Address */}
      <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-gold" />
          <p className="text-sm font-medium text-navy dark:text-white">
            Delivering to
          </p>
        </div>
        <p className="text-sm font-medium">{selectedAddress.fullName}</p>
        <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
        <p className="text-sm text-muted-foreground">
          {selectedAddress.street}, {selectedAddress.city},{' '}
          {selectedAddress.district} {selectedAddress.postalCode}
        </p>
      </div>

      {/* Order Items */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy dark:text-white">
          Items ({items.length})
        </p>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                {item.product.primaryImage ? (
                  <Image
                    src={item.product.primaryImage}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {item.product.name}
                </p>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-navy dark:text-white">
                    {formatPrice(item.itemTotal)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Promo Code */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-navy dark:text-white">
          Promo Code
        </p>
        {promoCode ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Tag className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400 flex-1">
              {promoCode} - {formatPrice(promoDiscount)} off
              {promoDiscountType === 'PERCENTAGE' &&
                ` (${Math.round((promoDiscount / subtotal) * 100)}%)`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600 hover:text-destructive cursor-pointer"
              onClick={onPromoClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
              className="uppercase"
            />
            <Button
              variant="outline"
              onClick={handleApplyPromo}
              disabled={isValidating || !promoInput.trim()}
              className="cursor-pointer shrink-0"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount ({promoCode})</span>
            <span className="text-green-600">
              -{formatPrice(promoDiscount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-navy dark:text-white">
          <span>Total</span>
          <span className="text-lg">{formatPrice(discountedTotal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          onClick={onNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </div>
    </div>
  );
}
