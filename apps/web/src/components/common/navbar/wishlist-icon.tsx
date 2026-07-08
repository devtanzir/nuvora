'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { ROUTES } from '@/constants/routes';
import Badge from './badge';

export function WishlistIcon({ iconColor }: { iconColor: string }) {
  const { data } = useWishlist();
  const count = data?.meta.total ?? 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`hidden md:inline-flex relative transition-colors ${iconColor}`}
        asChild
        aria-label={`Wishlist (${count} items)`}
      >
        <Link href={ROUTES.WISHLIST}>
          <Heart className="h-5 w-5" />
          <Badge count={count} />
        </Link>
      </Button>
    </>
  );
}
