import { motion } from 'framer-motion';
import { cardContainerVariants, cardItemVariants } from '../motion/testimonial';
import { REVIEWS } from '../constants/testimonial';
import StarRating from './star-rating';

const ReviewCard = ({reduceMotion}: {reduceMotion: boolean | null}) => {
  return (
    <>
        <motion.div
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.2 }}
          variants={cardContainerVariants}
          className="mx-auto mt-[70px] grid max-w-[90rem] grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-[80px] lg:grid-cols-3 lg:gap-8"
        >
          {REVIEWS.map((review) => (
            <motion.div
              key={review.name}
              variants={cardItemVariants}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`bg-card flex flex-col items-start gap-5 rounded-[6px] p-9 lg:p-10`}
            >
              <StarRating />
              <p className="text-lg leading-relaxed text-primary">&ldquo;{review.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-medium text-primary">{review.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {review.location}
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Purchased - {review.purchased}
              </p>
            </motion.div>
          ))}
        </motion.div>
    </>
  );
};

export default ReviewCard;
