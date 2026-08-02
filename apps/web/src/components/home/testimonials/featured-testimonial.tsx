import { motion } from 'framer-motion';
import StarRating from './star-rating';
import { FEATURED_REVIEW } from '../constants/testimonial';

const FeaturedTestimonial = ({
  reveal,
}: {
  reveal: (num: number) => Record<string, unknown>;
}) => {
  return (
    <>
      <motion.div
        {...reveal(0.28)}
        className="relative mx-auto mt-[70px] max-w-3xl text-center md:mt-[80px] lg:mt-[90px]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-heading text-[120px] leading-none text-accent/15 md:-top-14 md:text-[160px]"
        >
          &ldquo;
        </span>

        <div className="relative flex flex-col items-center">
          <StarRating />
          <p className="mt-7 font-heading text-[22px] font-light leading-[1.5] text-primary sm:text-[26px] lg:text-[28px]">
            &ldquo;{FEATURED_REVIEW.quote}&rdquo;
          </p>
          <p className="mt-8 text-base font-medium text-primary">
            {FEATURED_REVIEW.name}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {FEATURED_REVIEW.location}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
            Purchased - {FEATURED_REVIEW.purchased}
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default FeaturedTestimonial;
