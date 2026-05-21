import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { PackageX } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Product } from '@/types/product.types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching?: boolean;
}

export function ProductGrid({ products, isLoading, isFetching }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-3/4 rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <PackageX className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium text-navy dark:text-white">
            No products found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-opacity duration-200',
        isFetching ? 'opacity-60' : 'opacity-100',
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
