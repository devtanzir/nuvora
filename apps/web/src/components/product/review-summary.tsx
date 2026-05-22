'use client';

import { Star } from 'lucide-react';
import { ReviewSummary } from '@/services/review.service';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  summary: ReviewSummary;
}

export function ReviewSummaryCard({ summary }: ReviewSummaryProps) {
  const { avgRating, totalReviews, distribution } = summary;

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-muted/30 rounded-2xl border border-border">
      {/* Average Rating */}
      <div className="flex flex-col items-center justify-center min-w-[120px]">
        <p className="text-5xl font-playfair font-bold text-navy dark:text-white">
          {avgRating.toFixed(1)}
        </p>
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < Math.round(avgRating)
                  ? 'fill-gold text-gold'
                  : 'fill-muted text-muted-foreground',
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Distribution */}
      <div className="flex-1 space-y-2">
        {([5, 4, 3, 2, 1] as const).map((rating) => {
          const count = distribution[rating];
          const percentage =
            totalReviews > 0
              ? Math.round((count / totalReviews) * 100)
              : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {rating}
                </span>
                <Star className="h-3 w-3 fill-gold text-gold" />
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
