'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/types/product.types';
import { useProductFilters } from '@/hooks/use-product-filters';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
];

export function ProductSort() {
  const { filters, setFilter } = useProductFilters();

  return (
    <Select
      value={filters.sortBy ?? 'newest'}
      onValueChange={(value) => setFilter('sortBy', value as SortOption)}
    >
      <SelectTrigger className="w-[180px] cursor-pointer">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
