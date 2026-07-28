import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ARROW_VARIANTS,
  HOVER_SPRING,
  UNDERLINE_VARIANTS,
} from '../constants/new-arrivals';
import { ArrowRight } from 'lucide-react';
import useEditorialIntro from '../hooks/useEditorialIntro';

const MotionLink = motion(Link);

const EditorialIntro = () => {
  const { introRef, eyebrowRef, headingRef, ctaRef } = useEditorialIntro();

  return (
    <section
      ref={introRef}
      aria-label="New Arrivals introduction"
      className="flex min-h-[55vh] w-full items-center bg-background pt-16 pb- 0 md:min-h-[62vh] lg:min-h-[68vh]"
    >
      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-10 px-6 md:grid-cols-12 md:gap-8 md:px-10">
        <div className="md:col-span-8 lg:col-span-7">
          <span
            ref={eyebrowRef}
            className="text-xs font-medium uppercase tracking-[0.3em] text-accent/80"
          >
            New Arrivals
          </span>
          <h2
            ref={headingRef}
            className="mt-6 font-heading text-4xl leading-[1.15] text-primary sm:text-5xl lg:text-6xl"
          >
            The latest additions,
            <br />
            crafted for today.
          </h2>
          <p className="mt-6 max-w-[46ch] text-sm text-muted-foreground md:text-base">
            A quiet edit of what&apos;s just arrived, considered pieces, chosen
            for how they&apos;ll actually be worn.
          </p>
          <MotionLink
            ref={ctaRef}
            href="/products?sort=newest"
            initial="rest"
            whileHover="hover"
            whileFocus="hover"
            className="group mt-9 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span className="relative pb-0.5">
              View All New Arrivals
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
        </div>

        <div
          aria-hidden="true"
          className="hidden md:col-span-4 md:block lg:col-span-5"
        />
      </div>
    </section>
  );
};

export default EditorialIntro;
