'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { FeaturedCollectionProps } from '../interface/featured-collection';
import { EASE_CLASS } from '../constants/featured-collection';
import CollectionSkeleton from './featured-skeleton';
import CollectionCard from './collection-card';


export default function FeaturedCollection({
  eyebrow = 'Featured Collection',
  title = 'Curated for the Season',
  description = 'Timeless pieces, thoughtfully designed for modern living.',
  viewAllLabel = 'View All Collection',
  viewAllHref = '/products',
  categorySlug = 'featured',
  limit = 4,
}: FeaturedCollectionProps) {

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', categorySlug, limit],
    queryFn: () => productService.getProducts({ categorySlug, limit }),
  });

  const products = data?.products ?? [];
  const hasEditorialLayout = products.length >= 4;

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10 xl:px-16 2xl:px-24">
        {/* Section header */}
        <div className="mb-14 flex flex-col items-start justify-between gap-8 md:mb-20 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent/80">
              {eyebrow}
            </span>
            <span className="mt-4 block h-px w-10 bg-accent" aria-hidden="true" />
            <h2 className="mt-8 max-w-xl font-heading text-5xl leading-[1.1] text-primary md:text-6xl">
              {title}
            </h2>
            <p className="mt-4 max-w-[46ch] text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          </div>

          <Link
            href={viewAllHref}
            className={`group inline-flex shrink-0 items-center gap-3 self-start text-xs font-medium uppercase tracking-[0.2em] text-primary transition-colors duration-300 ${EASE_CLASS} md:self-end`}
          >
            <span
              className={`border-b border-transparent pb-0.5 transition-colors duration-300 ${EASE_CLASS} group-hover:border-accent/60 group-hover:text-accent`}
            >
              {viewAllLabel}
            </span>
            <ArrowRight
              className={`h-4 w-4 text-accent transition-transform duration-300 ${EASE_CLASS} group-hover:translate-x-1`}
            />
          </Link>
        </div>

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center gap-4 border border-border py-24 text-center">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load this collection right now.
            </p>
            <button
              onClick={() => refetch()}
              className={`text-xs font-medium uppercase tracking-[0.2em] text-accent transition-colors duration-300 ${EASE_CLASS} hover:text-primary`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading state */}
        {!isError && isLoading && <CollectionSkeleton count={limit} />}

        {/* Empty state */}
        {!isError && !isLoading && products.length === 0 && (
          <div className="border border-border py-24 text-center">
            <p className="text-sm text-muted-foreground">
              No products are available in this collection yet.
            </p>
          </div>
        )}

        {/* Editorial asymmetric layout - desktop, exactly 4 (or more) products */}
        {!isError && !isLoading && hasEditorialLayout && (
          <>
            <div className="hidden lg:grid lg:h-[860px] lg:grid-cols-12 lg:grid-rows-2 gap-3">
              <div className="lg:col-span-7 lg:row-span-2">
                <CollectionCard product={products[0]} index={0} size="large" className="h-full" />
              </div>
              <div className="lg:col-span-5 lg:row-span-1">
                <CollectionCard product={products[1]} index={1} size="default" className="h-full" />
              </div>
              <div className="lg:col-span-5 lg:row-span-1 lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-5">
                <CollectionCard product={products[2]} index={2} size="compact" className="h-full" />
                <CollectionCard product={products[3]} index={3} size="compact" className="h-full" />
              </div>
            </div>

            {/* Responsive fallback - tablet & mobile */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
              {products.map((product, index) => (
                <CollectionCard
                  key={product.id}
                  product={product}
                  index={index}
                  size="default"
                  className="aspect-[5/8]"
                />
              ))}
            </div>
          </>
        )}

        {/* Fallback grid for any product count other than 4 */}
        {!isError && !isLoading && !hasEditorialLayout && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <CollectionCard
                key={product.id}
                product={product}
                index={index}
                size="default"
                className="aspect-[5/8]"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
