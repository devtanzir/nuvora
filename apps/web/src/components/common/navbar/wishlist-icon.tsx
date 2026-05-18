'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export function WishlistIcon() {
  return (
    <Button variant="ghost" size="icon" className="cursor-pointer" asChild>
      <Link href={ROUTES.WISHLIST}>
        <Heart className="h-5 w-5" />
        <span className="sr-only">Wishlist</span>
      </Link>
    </Button>
  );
}
