'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/hooks/use-cart';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export default function CartContent() {
  const { isLoading } = useCart();
  const { items, subtotal, itemCount } = useCartStore();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground">Add some products to get started</p>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white"
          asChild
        >
          <Link href={ROUTES.PRODUCTS}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Shop Now
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-playfair font-bold text-navy dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 rounded-xl border border-border bg-card flex gap-4"
                >
                  <Link href={ROUTES.PRODUCT(item.product.slug)} className="shrink-0">
                    <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted border border-border">
                      {item.product.primaryImage ? (
                        <Image
                          src={item.product.primaryImage}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={ROUTES.PRODUCT(item.product.slug)}>
                          <p className="font-medium hover:text-gold transition-colors line-clamp-2">
                            {item.product.name}
                          </p>
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(item.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                          disabled={item.variant ? item.quantity >= item.variant.stock : false}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-navy dark:text-white">
                        {formatPrice(item.itemTotal)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" asChild>
                <Link href={ROUTES.PRODUCTS}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => clearCart()}
                disabled={isClearing}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card space-y-4 sticky top-24">
              <h2 className="font-playfair font-bold text-lg text-navy dark:text-white">
                Order Summary
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({itemCount} items)
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-navy dark:text-white">
                <span>Total</span>
                <span className="text-xl">{formatPrice(subtotal)}</span>
              </div>

              <Button
                className="w-full bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white"
                size="lg"
                asChild
              >
                <Link href={ROUTES.CHECKOUT}>
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
