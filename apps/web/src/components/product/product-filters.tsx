'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/product.types';
import { useProductFilters } from '@/hooks/use-product-filters';

interface ProductFiltersProps {
  categories: Category[];
}

const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: 'Over $500', min: 500, max: undefined },
] as const;

const RATINGS = [4, 3, 2, 1] as const;

export function ProductFilters({ categories }: ProductFiltersProps) {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters } =
    useProductFilters();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-navy dark:text-white" />
          <span className="font-medium text-navy dark:text-white">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-destructive cursor-pointer h-auto p-0"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy dark:text-white">
          Category
        </p>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={filters.categorySlug === category.slug}
                onCheckedChange={(checked) =>
                  setFilter(
                    'categorySlug',
                    checked ? category.slug : undefined,
                  )
                }
              />
              <Label
                htmlFor={`cat-${category.slug}`}
                className="text-sm cursor-pointer flex items-center justify-between w-full"
              >
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs ml-2">
                  {category.productCount}
                </Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy dark:text-white">
          Price Range
        </p>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
  const isActive =
    filters.minPrice === range.min * 100 &&
    filters.maxPrice ===
      (range.max !== undefined ? range.max * 100 : undefined);

  return (
    <div key={range.label} className="flex items-center gap-2">
      <Checkbox
        id={`price-${range.label}`}
        checked={isActive}
        onCheckedChange={(checked) => {
          if (checked) {
            setFilters({
              minPrice: range.min * 100,
              maxPrice: range.max ? range.max * 100 : undefined,
            });
          } else {
            setFilters({
              minPrice: undefined,
              maxPrice: undefined,
            });
          }
        }}
      />
      <Label
        htmlFor={`price-${range.label}`}
        className="text-sm cursor-pointer"
      >
        {range.label}
      </Label>
    </div>
  );
})}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy dark:text-white">
          Minimum Rating
        </p>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) =>
                  setFilter('rating', checked ? rating : undefined)
                }
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="text-sm cursor-pointer flex items-center gap-1"
              >
                <span className="text-gold">{'★'.repeat(rating)}</span>
                <span className="text-muted-foreground">
                  {'☆'.repeat(5 - rating)}
                </span>
                <span className="text-muted-foreground">& up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={!!filters.inStock}
          onCheckedChange={(checked) =>
            setFilter('inStock', checked ? true : undefined)
          }
        />
        <Label htmlFor="in-stock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>
    </div>
  );
}
