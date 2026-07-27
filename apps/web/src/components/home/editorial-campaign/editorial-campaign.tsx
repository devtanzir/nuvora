'use client';

import { motion } from 'framer-motion';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { EditorialPauseProps } from '../interface/editorial-campaign';
import {
  ARROW_SPRING,
  ARROW_VARIANTS,
  UNDERLINE_VARIANTS,
} from '../constants/editorial-campaign';
import useEditorial from '../hooks/useEditorial';

const MotionLink = motion(Link);

export default function EditorialPause({
  eyebrow = 'Autumn 2026',
  headingLine1 = 'Designed to be worn,',
  headingLine2 = 'not collected.',
  ctaLabel = 'Explore Campaign',
  ctaHref = '/products',
}: EditorialPauseProps) {
  const {
    imageSrc,
    sectionRef,
    driftRef,
    depthRef,
    eyebrowRef,
    headingRef,
    ctaRef,
  } = useEditorial();
  return (
    <section
      ref={sectionRef}
      aria-labelledby="editorial-pause-heading"
      className="relative w-full overflow-hidden h-[440px] md:h-[520px] lg:h-[580px] xl:h-[650px]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div ref={driftRef} className="absolute -inset-y-16 -inset-x-10">
          <div ref={depthRef} className="absolute inset-0">
            <Image
              src={imageSrc}
              alt={'Editorial Image'}
              fill
              sizes="100vw"
              className="object-cover object-[60%_20%] md:object-[38%_center]"
            />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full items-end justify-center px-6 pb-10 md:items-center md:justify-end md:px-10 md:pb-0 xl:px-16 2xl:px-24">
        <div className="flex w-[80%] flex-col items-center text-center md:w-auto md:max-w-md md:items-end md:text-right">
          <span
            ref={eyebrowRef}
            className="text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/70"
          >
            {eyebrow}
          </span>

          <h2
            id="editorial-pause-heading"
            ref={headingRef}
            className="mt-5 font-heading text-3xl leading-[1.3] text-primary-foreground md:text-4xl xl:text-[2.75rem]"
          >
            {headingLine1}
            <br />
            {headingLine2}
          </h2>

          <div ref={ctaRef} className="mt-7">
            <MotionLink
              href={ctaHref}
              initial="rest"
              whileHover="hover"
              whileFocus="hover"
              className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="relative pb-0.5">
                {ctaLabel}
                <motion.span
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-muted"
                  variants={UNDERLINE_VARIANTS}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              </span>
              <motion.span variants={ARROW_VARIANTS} transition={ARROW_SPRING}>
                <ArrowRight
                  className="h-4 w-4 text-accent"
                  aria-hidden="true"
                />
              </motion.span>
            </MotionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
