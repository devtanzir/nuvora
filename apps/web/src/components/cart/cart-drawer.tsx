'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/store/cart.store';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, itemCount } = useCartStore();
  const { isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();

  return (
    <Drawer open={isOpen} onOpenChange={closeCart} direction="right">
      <DrawerContent className="h-full w-full sm:w-[420px] right-0 left-auto rounded-none flex flex-col">
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border">
          <DrawerTitle className="font-playfair text-xl font-bold text-navy dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </DrawerTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </DrawerHeader>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 w-full px-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-20 w-20 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-navy dark:text-white">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground">
                Add some products to get started
              </p>
            </div>
            <Button
              className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
              onClick={closeCart}
              asChild
            >
              <Link href={ROUTES.PRODUCTS}>
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Image */}
                    <Link
                      href={ROUTES.PRODUCT(item.product.slug)}
                      onClick={closeCart}
                      className="shrink-0"
                    >
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted border border-border">
                        {item.product.primaryImage ? (
                          <Image
                            src={item.product.primaryImage}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={ROUTES.PRODUCT(item.product.slug)}
                        onClick={closeCart}
                      >
                        <p className="text-sm font-medium line-clamp-1 hover:text-gold transition-colors">
                          {item.product.name}
                        </p>
                      </Link>

                      {item.variant && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}

                      <p className="text-sm font-bold text-navy dark:text-white mt-1">
                        {formatPrice(item.product.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 border border-border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() =>
                              updateItem({
                                itemId: item.id,
                                quantity: item.quantity - 1,
                              })
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() =>
                              updateItem({
                                itemId: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            disabled={
                              item.variant
                                ? item.quantity >= item.variant.stock
                                : false
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer"
                          onClick={() => removeItem(item.id)}
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-navy dark:text-white text-lg">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
                  asChild
                  onClick={closeCart}
                >
                  <Link href={ROUTES.CHECKOUT}>
                    Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  asChild
                  onClick={closeCart}
                >
                  <Link href={ROUTES.CART}>View Cart</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive cursor-pointer"
                  onClick={() => clearCart()}
                  disabled={isClearing}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
