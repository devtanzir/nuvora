import { motion } from 'framer-motion';
import Link from 'next/link';
import { ARROW_VARIANTS, UNDERLINE_VARIANTS } from '../motion/testimonial';
import { HOVER_SPRING } from '../motion/brand-philosophy';
import { ArrowRight } from 'lucide-react';

const MotionLink = motion(Link);

const TestimonialCta = ({
  reveal,
}: {
  reveal: (num: number) => Record<string, unknown>;
}) => {
  return (
    <>
      <motion.div
        {...reveal(0.1)}
        className="mt-16 flex justify-center lg:mt-20"
      >
        <MotionLink
          href="/"
          initial="rest"
          whileHover="hover"
          whileFocus="hover"
          className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="relative pb-0.5">
            Read More Reviews
            <motion.span
              className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent"
              variants={UNDERLINE_VARIANTS}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              aria-hidden="true"
            />
          </span>
          <motion.span variants={ARROW_VARIANTS} transition={HOVER_SPRING}>
            <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
          </motion.span>
        </MotionLink>
      </motion.div>
    </>
  );
};

export default TestimonialCta;
