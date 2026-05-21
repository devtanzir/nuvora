'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductFilters } from '@/hooks/use-product-filters';

interface ProductPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function ProductPagination({
  totalPages,
  currentPage,
}: ProductPaginationProps) {
  const { setFilter } = useProductFilters();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show max 5 pages at a time
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages;

    if (currentPage <= 3) return pages.slice(0, 5);
    if (currentPage >= totalPages - 2) return pages.slice(totalPages - 5);

    return pages.slice(currentPage - 3, currentPage + 2);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Previous */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setFilter('page', currentPage - 1)}
        disabled={currentPage === 1}
        className="cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* First page */}
      {visiblePages[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? 'default' : 'outline'}
            size="icon"
            onClick={() => setFilter('page', 1)}
            className="cursor-pointer"
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className="text-muted-foreground px-1">...</span>
          )}
        </>
      )}

      {/* Visible pages */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="icon"
          onClick={() => setFilter('page', page)}
          className={
            currentPage === page
              ? 'bg-navy text-white dark:bg-gold dark:text-navy cursor-pointer'
              : 'cursor-pointer'
          }
        >
          {page}
        </Button>
      ))}

      {/* Last page */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="text-muted-foreground px-1">...</span>
          )}
          <Button
            variant={currentPage === totalPages ? 'default' : 'outline'}
            size="icon"
            onClick={() => setFilter('page', totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setFilter('page', currentPage + 1)}
        disabled={currentPage === totalPages}
        className="cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
