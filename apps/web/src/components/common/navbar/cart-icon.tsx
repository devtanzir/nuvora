'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';
import { ROUTES } from '@/constants/routes';

export function CartIcon() {
  const { itemCount } = useCartStore();

  return (
    <Button variant="ghost" size="icon" className="relative cursor-pointer" asChild>
      <Link href={ROUTES.CART} className='cursor-pointer'>
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-[10px] font-bold text-white flex items-center justify-center">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
        <span className="sr-only">Cart</span>
      </Link>
    </Button>
  );
}
