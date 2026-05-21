'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useProductFilters } from '@/hooks/use-product-filters';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/product/product-filters';
import { ProductSort } from '@/components/product/product-sort';
import { ProductPagination } from '@/components/product/product-pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function ProductsContent() {
  const { filters, hasActiveFilters, resetFilters } = useProductFilters();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filters),
    queryFn: () => productService.getProducts(filters),
    placeholderData: keepPreviousData,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: productService.getCategories,
    placeholderData: keepPreviousData,
  });

  const products = productsData?.products ?? [];
  const meta = productsData?.meta;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">
              Collection
            </p>
            <h1 className="text-4xl font-playfair font-bold text-navy dark:text-white">
              All Products
            </h1>
            {meta && (
              <p className="text-muted-foreground mt-2">
                {meta.total} products found
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              {!isLoadingCategories && categories && (
                <ProductFilters categories={categories} />
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden cursor-pointer"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <Badge className="ml-2 bg-gold text-navy h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          !
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {!isLoadingCategories && categories && (
                        <ProductFilters categories={categories} />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Active filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-destructive hover:text-destructive cursor-pointer"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Sort */}
              <ProductSort />
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={products}
              isLoading={isLoadingProducts}
              isFetching={isFetchingProducts}
            />

            {/* Pagination */}
            {meta && (
              <ProductPagination
                totalPages={meta.totalPages}
                currentPage={meta.page}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
