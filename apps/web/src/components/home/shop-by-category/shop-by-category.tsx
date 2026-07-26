'use client';

import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { QUERY_KEYS } from '@/constants/query-keys';
import { productService } from '@/services/product.service';
import { Category } from '@/types/product.types';
import { ShopByCategoryProps } from '../interface/shop-category';
import { CURATED_ORDER, EASE_CLASS} from '../constants/shop-category';
import EditorialSkeleton from './editorial-skeleton';
import EditorialSpread from './editorial-spread';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}


export default function ShopByCategory({
  eyebrow = 'Shop by Category',
  title = 'Discover Every Collection',
  description = 'Six worlds, one point of view.',
  viewAllLabel = 'View All Categories',
  viewAllHref = '/categories',
}: ShopByCategoryProps) {

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: productService.getCategories,
  });

  const curatedCategories = CURATED_ORDER.map((slug) =>
    categories?.find((cat) => cat.slug === slug),
  ).filter((cat): cat is Category => Boolean(cat));

  const bySlug = Object.fromEntries(curatedCategories.map((cat) => [cat.slug, cat])) as Partial<
    Record<(typeof CURATED_ORDER)[number], Category>
  >;

  return (
    <section
      aria-labelledby="shop-by-category-heading"
      className="w-full bg-background py-20 md:py-32"
    >
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10 xl:px-16 2xl:px-24">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:mb-24 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent/80">
              {eyebrow}
            </span>
            <span className="mt-4 block h-px w-10 bg-accent" aria-hidden="true" />
            <h2
              id="shop-by-category-heading"
              className="mt-8 max-w-xl font-heading text-5xl leading-[1.1] text-primary md:text-6xl"
            >
              {title}
            </h2>
            <p className="mt-4 max-w-[28ch] text-sm text-muted-foreground md:text-base">
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
              We couldn&apos;t load our categories right now.
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
        {!isError && isLoading && <EditorialSkeleton />}

        {/* Empty state */}
        {!isError && !isLoading && curatedCategories.length === 0 && (
          <div className="border border-border py-24 text-center">
            <p className="text-sm text-muted-foreground">
              No categories are available yet.
            </p>
          </div>
        )}

        {/* Bespoke editorial spread */}
        {!isError && !isLoading && curatedCategories.length > 0 && (
          <EditorialSpread bySlug={bySlug} viewAllHref={viewAllHref} />
        )}
      </div>
    </section>
  );
}
