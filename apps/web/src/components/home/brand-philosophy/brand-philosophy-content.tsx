import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ARROW_VARIANTS,
  HOVER_SPRING,
  UNDERLINE_VARIANTS,
} from '../motion/brand-philosophy';
import { ArrowRight } from 'lucide-react';

const MotionLink = motion(Link);

const BrandPhilosophyContent = ({
  reveal,
}: {
  reveal: (num: number) => Record<string, unknown>;
}) => {
  return (
    <>
      <div className="flex flex-col items-start px-0 lg:px-[10%] xl:px-[14%]">
        <motion.span
          {...reveal(0.1)}
          className="text-xs font-medium uppercase tracking-[0.35em] text-accent/80"
        >
          Philosophy
        </motion.span>

        <motion.h2
          {...reveal(0.2)}
          className="mt-8 font-heading text-[44px] font-light leading-[1.2] text-primary sm:text-[56px] lg:text-[72px] xl:text-[80px] xl:leading-[1.15]"
        >
          Crafted Slowly.
          <br />
          Designed to Last.
        </motion.h2>

        <motion.div
          {...reveal(0.32)}
          className="mt-9 flex max-w-[34ch] flex-col gap-5"
        >
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Nuvora is built on patience, fabrics chosen for how they age, not
            how they first appear.
          </p>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Every piece is designed to be worn for years, not seasons. Quiet,
            considered, unhurried.
          </p>
        </motion.div>

        <motion.div {...reveal(0.44)} className="mt-11">
          <MotionLink
            href="/about"
            initial="rest"
            whileHover="hover"
            whileFocus="hover"
            className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span className="relative pb-0.5">
              Discover Our Story
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
      </div>
    </>
  );
};

export default BrandPhilosophyContent;
