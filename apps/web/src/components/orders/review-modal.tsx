'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reviewService } from '@/services/review.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating required').max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(1000).optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
  productId: string;
  productName: string;
  orderId: string;
  onClose: () => void;
}

export function ReviewModal({
  productId,
  productName,
  orderId,
  onClose,
}: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch('rating');

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewService.submitReview({
        productId,
        orderId,
        rating: data.rating,
        title: data.title,
        body: data.body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REVIEWS(productId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REVIEW_SUMMARY(productId),
      });
      toast.success('Review submitted successfully');
      onClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to submit review'));
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair">Write a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 mb-2">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {productName}
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => submitReview(data))} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setValue('rating', star)}
                  className="cursor-pointer"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoverRating || rating) >= star
                        ? 'fill-gold text-gold'
                        : 'text-muted-foreground',
                    )}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Title (optional)</Label>
            <Input
              placeholder="Summarize your experience"
              {...register('title')}
            />
          </div>

          <div className="space-y-2">
            <Label>Review (optional)</Label>
            <Textarea
              placeholder="Tell others about your experience..."
              rows={4}
              {...register('body')}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
              disabled={isPending || rating === 0}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
