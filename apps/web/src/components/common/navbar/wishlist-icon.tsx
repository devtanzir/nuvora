'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { ROUTES } from '@/constants/routes';

export function WishlistIcon() {
  const { data } = useWishlist();
  const count = data?.meta.total ?? 0;

  return (
    <Button variant="ghost" size="icon" className="relative cursor-pointer" asChild>
      <Link href={ROUTES.WISHLIST}>
        <Heart
          className={`h-5 w-5 transition-colors ${
            count > 0 ? 'fill-gold text-gold' : ''
          }`}
        />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-[10px] font-bold text-navy flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
        <span className="sr-only">Wishlist</span>
      </Link>
    </Button>
  );
}
