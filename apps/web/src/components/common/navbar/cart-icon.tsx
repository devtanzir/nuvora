'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';
import Badge from './badge';

export function CartIcon({ iconColor }: { iconColor: string }) {
  const { itemCount, toggleCart } = useCartStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`hidden md:inline-flex relative transition-colors cursor-pointer ${iconColor}`}
      onClick={toggleCart}
      aria-label={`Cart (${itemCount} items)`}
    >
      <ShoppingBag className="h-5 w-5" />
      <Badge count={itemCount} />
    </Button>
  );
}
