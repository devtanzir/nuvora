'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product.types';
import { ROUTES } from '@/constants/routes';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useAddToCart } from '@/hooks/use-cart';
import { useAddToWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: addToWishlist } = useAddToWishlist();

  const discountPercent =
    product.originalPrice
      ? getDiscountPercent(product.originalPrice, product.price)
      : null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    addToCart({ productId: product.id, quantity: 1 });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    addToWishlist(product.id);
  };

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-gold/50 hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <Link href={ROUTES.PRODUCT(product.slug)}>
        <div className="relative aspect-3/4 overflow-hidden bg-muted">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product?.name}
              width={300}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discountPercent && (
              <Badge className="bg-gold text-navy text-xs font-bold">
                -{discountPercent}%
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist button - always visible, handles auth check */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black rounded-full h-8 w-8 cursor-pointer"
            onClick={handleAddToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <Link href={ROUTES.PRODUCT(product.slug)}>
          <p className="text-xs text-muted-foreground">
            {product.category?.name}
          </p>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-gold transition-colors">
            {product?.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-xs text-muted-foreground">
              {product.avgRating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-navy dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to cart - always visible, handles auth check */}
        {product.stock > 0 && (
          <Button
            size="sm"
            className="w-full bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            disabled={isAddingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="mr-2 h-3 w-3" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}
