'use client';

import { Search, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import useSearch from './hooks/useSearch';

export function SearchDialog() {

  const { query, setQuery, data, isLoading, handleSelect, handleSearch, isSearchOpen, closeSearch, debouncedQuery } = useSearch();

  return (
    <Dialog open={isSearchOpen} onOpenChange={closeSearch}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {debouncedQuery.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No products found for &quot;{debouncedQuery}&quot;
            </div>
          ) : (
            <div className="py-2">
              {data?.products?.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-navy dark:text-white shrink-0">
                    {formatPrice(product.price)}
                  </p>
                </button>
              ))}

              {/* View all results */}
              <button
                onClick={handleSearch}
                className="w-full px-4 py-3 text-sm text-gold hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-border"
              >
                <Search className="h-4 w-4" />
                View all results for &quot;{debouncedQuery}&quot;
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
