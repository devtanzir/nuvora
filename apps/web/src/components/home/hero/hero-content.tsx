import { motion } from 'framer-motion';
import { DESCRIPTION, EASE_CLASS, HEADING_LINES, introItem } from '../constants/hero-constants';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroContentProps } from '../interface/hero';


const HeroContent = ({ textColRef }: HeroContentProps) => {
  return (
    <>
        <div ref={textColRef} className="flex flex-col items-start space-y-7">
          <motion.span
            variants={introItem}
            className="text-[10px] opacity-60 font-medium uppercase tracking-[0.25em] text-accent transition-colors duration-300"
          >
            EST. 2026
          </motion.span>
          <motion.span
            variants={introItem}
            className="text-xs font-medium uppercase tracking-[0.25em] text-accent transition-colors duration-300"
          >
            New Collection
          </motion.span>

          <motion.h1
            variants={introItem}
            className="font-heading text-6xl leading-[1.05] text-primary transition-colors duration-300 md:text-7xl xl:text-8xl"
          >
            {HEADING_LINES.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={introItem}
            className="max-w-[42ch] font-sans text-lg text-muted-foreground transition-colors duration-300 md:text-xl"
          >
            {DESCRIPTION}
          </motion.p>

          <motion.div
            variants={introItem}
            className="flex flex-wrap items-center gap-5 pt-3"
          >
            <Button
              asChild
              className={`group rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-200 ${EASE_CLASS} hover:-translate-y-0.5 hover:bg-primary/90 active:scale-[0.98]`}
            >
              <Link href={ROUTES.PRODUCTS}>
                Shop Collection
                <ArrowRight
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${EASE_CLASS} group-hover:translate-x-1`}
                />
              </Link>
            </Button>

            <Link
              href={ROUTES.PRODUCTS}
              className={`group inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-300 ${EASE_CLASS}`}
            >
              <span
                className={`border-b border-transparent transition-colors duration-200 ${EASE_CLASS} group-hover:border-accent`}
              >
                Explore Lookbook
              </span>
              <ArrowRight
                className={`h-3.5 w-3.5 transition-transform duration-200 ${EASE_CLASS} group-hover:translate-x-1`}
              />
            </Link>
          </motion.div>
        </div>
    </>
  );
};

export default HeroContent;
