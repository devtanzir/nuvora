'use client';

import { motion } from 'framer-motion';
import { DEFAULT_VALUES, DURATION } from '../constants/brand-constants';
import { BrandValuesSectionProps } from '../interface/brand-value';
import { EASE_CLASS, EASE_PREMIUM } from '../constants/hero-constants';


export default function BrandValuesSection({
  eyebrow = 'New Standard',
  values = DEFAULT_VALUES,
}: BrandValuesSectionProps) {
  return (
    <section className="w-full bg-background border-t border-border py-16 md:py-24">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10 xl:px-16 2xl:px-24">
        {/* Eyebrow */}
        <div className="mb-16 flex items-center justify-center gap-4 md:mb-20 lg:mb-24">
          <span className="h-px w-8 bg-border md:w-24" aria-hidden="true" />
          <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
          <span className="text-[10px] md:text-xs font-medium uppercase tracking-[0.4em] text-accent">
            {eyebrow}
          </span>
          <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
          <span className="h-px w-8 bg-border md:w-24" aria-hidden="true" />
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 gap-y-14 gap-x-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION.slow,
                  delay: index * 0.08,
                  ease: EASE_PREMIUM,
                }}
                className={`relative group-target: flex flex-col items-center border-border/60 px-4 text-center transition-transform duration-300 ${EASE_CLASS} hover:-translate-y-1 group-hover:text-primary`}
              >
                {index !== 0 && (
                  <span
                    className="absolute left-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-border to-transparent lg:block"
                    aria-hidden="true"
                  />
                )}

                <Icon className="mb-5 h-7 w-7 text-accent" strokeWidth={1.25} />

                <h3
                  className="font-heading text-base  md:text-lg tracking-[0.08em] font-medium uppercase text-primary"
                >
                  {value.title}
                </h3>

                <p className="mt-3 max-w-[220px] text-sm leading-7 text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
