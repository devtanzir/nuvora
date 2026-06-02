'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductVariantSelector } from '@/components/product/product-variant-selector';
import { ReviewSummaryCard } from '@/components/product/review-summary';
import { ReviewList } from '@/components/product/review-list';
import { ProductCard } from '@/components/product/product-card';
import { useProduct, useReviewSummary } from '@/hooks/use-product';
import { useAddToCart } from '@/hooks/use-cart';
import { useAddToWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { ProductVariant } from '@/types/product.types';
import { toast } from 'sonner';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';

interface ProductDetailContentProps {
  slug: string;
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useProduct(slug);
  const { data: reviewSummary } = useReviewSummary(product?.id ?? '');
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const { addProduct } = useRecentlyViewed();

useEffect(() => {
  if (product) {
    addProduct(product);
  }
}, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (product?.variants.length && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    addToCart({
      productId: product!.id,
      variantId: selectedVariant?.id,
      quantity,
    });
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    addToWishlist(product!.id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.PRODUCTS}>Back to Products</Link>
        </Button>
      </div>
    );
  }

  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.variants.length > 0
    ? 0
    : product.stock;

  const currentPrice = selectedVariant?.price ?? product.price;

  const discountPercent = product.originalPrice
    ? getDiscountPercent(product.originalPrice, currentPrice)
    : null;

  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={ROUTES.HOME} className="hover:text-gold transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={ROUTES.PRODUCTS} className="hover:text-gold transition-colors">
              Products
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={ROUTES.CATEGORY(product.category.slug)}
              className="hover:text-gold transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Category + Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={ROUTES.CATEGORY(product.category.slug)}
                className="text-sm text-gold hover:underline"
              >
                {product.category.name}
              </Link>
              {discountPercent && (
                <Badge className="bg-gold text-navy font-bold">
                  -{discountPercent}%
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
              {isLowStock && (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  Only {currentStock} left
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-playfair font-bold text-navy dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {reviewSummary && reviewSummary.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(reviewSummary.avgRating)
                          ? 'fill-gold text-gold'
                          : 'fill-muted text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {reviewSummary.avgRating.toFixed(1)} ({reviewSummary.totalReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-navy dark:text-white">
                {formatPrice(currentPrice)}
              </span>
              {product.originalPrice && currentPrice !== product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="text-sm text-green-600 font-medium">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            <Separator />

            {/* Variants */}
            {product.variants.length > 0 && (
              <ProductVariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-navy dark:text-white">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 cursor-pointer"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 cursor-pointer"
                    onClick={() =>
                      setQuantity((q) => Math.min(currentStock, q + 1))
                    }
                    disabled={quantity >= currentStock || isOutOfStock}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.variants.length > 0 && !selectedVariant
                    ? 'Select a variant first'
                    : `${currentStock} available`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'On orders over $50' },
                { icon: Shield, label: 'Secure Payment', sub: '100% protected' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '30 day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border"
                >
                  <Icon className="h-5 w-5 text-gold mb-1" />
                  <p className="text-xs font-medium text-navy dark:text-white">
                    {label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs — Description + Reviews */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-8 mb-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent pb-3 px-0 cursor-pointer font-medium"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent pb-3 px-0 cursor-pointer font-medium"
              >
                Reviews
                {reviewSummary && reviewSummary.totalReviews > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({reviewSummary.totalReviews})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Description */}
            <TabsContent value="description" className="mt-6">
              {product.description ? (
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                  {product.description}
                </p>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="mt-6 space-y-8">
              {reviewSummary && reviewSummary.totalReviews > 0 && (
                <ReviewSummaryCard summary={reviewSummary} />
              )}
              <ReviewList productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">
                  Discover
                </p>
                <h2 className="text-3xl font-playfair font-bold text-navy dark:text-white">
                  Related Products
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
