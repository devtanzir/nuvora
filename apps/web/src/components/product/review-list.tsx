'use client';

import { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useReviews } from '@/hooks/use-product';
import { formatDate } from '@/lib/utils';

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useReviews(productId, page);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.reviews.map((review) => (
        <div
          key={review.id}
          className="p-5 border border-border rounded-xl space-y-3 hover:border-gold/30 transition-colors"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.avatar ?? ''} />
                <AvatarFallback className="bg-navy text-white text-xs">
                  {review.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-navy dark:text-white">
                  {review.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-0.5 shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < review.rating
                      ? 'fill-gold text-gold'
                      : 'fill-muted text-muted-foreground',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          {review.title && (
            <p className="text-sm font-medium text-navy dark:text-white">
              {review.title}
            </p>
          )}
          {review.body && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.body}
            </p>
          )}
        </div>
      ))}

      {/* Load more */}
      {data.meta.page < data.meta.totalPages && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer"
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
