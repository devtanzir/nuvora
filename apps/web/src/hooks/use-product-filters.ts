'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { ProductFilters, SortOption } from '@/types/product.types';

export function useProductFilters(): {
  filters: ProductFilters;
  setFilter: (key: keyof ProductFilters, value: unknown) => void;
  setFilters: (updates: Partial<Record<keyof ProductFilters, unknown>>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ProductFilters = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || undefined,
    categorySlug: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    rating: searchParams.get('rating')
      ? Number(searchParams.get('rating'))
      : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    sortBy: (searchParams.get('sortBy') as SortOption) || 'newest',
  };

  const setFilter = useCallback(
    (key: keyof ProductFilters, value: unknown) => {
      const params = new URLSearchParams(searchParams.toString());
      const paramKey = key === 'categorySlug' ? 'category' : key;

      if (value === undefined || value === null || value === '') {
        params.delete(paramKey);
      } else {
        params.set(paramKey, String(value));
      }

      if (key !== 'page') params.set('page', '1');

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Set multiple filters at once — single router.push
  const setFilters = useCallback(
    (updates: Partial<Record<keyof ProductFilters, unknown>>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = key === 'categorySlug' ? 'category' : key;
        if (value === undefined || value === null || value === '') {
          params.delete(paramKey);
        } else {
          params.set(paramKey, String(value));
        }
      });

      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActiveFilters =
    !!filters.search ||
    !!filters.categorySlug ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    !!filters.rating ||
    !!filters.inStock;

  return { filters, setFilter, setFilters, resetFilters, hasActiveFilters };
}
