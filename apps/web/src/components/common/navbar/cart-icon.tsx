'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';

export function CartIcon() {
  const { itemCount, toggleCart } = useCartStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative cursor-pointer"
      onClick={toggleCart}
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-[10px] font-bold text-navy flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
      <span className="sr-only">Cart</span>
    </Button>
  );
}
