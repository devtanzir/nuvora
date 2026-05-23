'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWishlist, useRemoveFromWishlist, useMoveToCart } from '@/hooks/use-wishlist';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export function WishlistContent() {
  const [page] = useState(1);
  const { data, isLoading } = useWishlist(page);
  const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();
  const { mutate: moveToCart, isPending: isMoving } = useMoveToCart();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-gold" />
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase">
                Saved Items
              </p>
              <h1 className="text-3xl font-playfair font-bold text-navy dark:text-white">
                My Wishlist
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-3/4 rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-playfair font-bold text-navy dark:text-white">
                Your wishlist is empty
              </p>
              <p className="text-muted-foreground">
                Save items you love to your wishlist
              </p>
            </div>
            <Button
              className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
              asChild
            >
              <Link href={ROUTES.PRODUCTS}>
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {data.meta.total} {data.meta.total === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {data.items.map((item) => {
                  const { product } = item;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-gold/50 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image */}
                      <Link href={ROUTES.PRODUCT(product.slug)}>
                        <div className="relative aspect-3/4 overflow-hidden bg-muted">
                          {product.primaryImage ? (
                            <Image
                              src={product.primaryImage}
                              alt={product.name}
                              width={300}
                              height={400}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                            </div>
                          )}

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Badge variant="secondary">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <Link href={ROUTES.PRODUCT(product.slug)}>
                          <h3 className="font-medium text-sm line-clamp-2 hover:text-gold transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {product.avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-gold text-gold" />
                            <span className="text-xs text-muted-foreground">
                              {product.avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}

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

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer text-xs"
                            disabled={isOutOfStock || isMoving}
                            onClick={() =>
                              moveToCart({
                                productId: product.id,
                                data: { quantity: 1 },
                              })
                            }
                          >
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer px-2"
                            disabled={isRemoving}
                            onClick={() =>
                              removeFromWishlist(product.id)
                            }
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
