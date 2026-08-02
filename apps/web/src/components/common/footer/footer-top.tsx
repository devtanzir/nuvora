import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FooterTopProps } from "./interface";


const MotionLink = motion(Link);


const FooterTop = ({ headlineRef, paragraphRef, ctaRef }: FooterTopProps) => {
  return (
    <>
      <div className="relative flex min-h-[55vh] w-full items-center justify-center px-6 py-12 lg:min-h-[60vh] lg:py-0">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            ref={headlineRef}
            className={`font-heading text-[42px] font-light leading-[1.2] sm:text-[60px] lg:text-[88px] xl:text-[96px] text-primary`}
          >
            Crafted Slowly.
            <br />
            Designed to Last.
          </h2>

          <p
            ref={paragraphRef}
            className="mx-auto mt-10 max-w-[42ch] text-base leading-relaxed text-primary/70 md:mt-12 md:text-lg"
          >
            Every collection begins with intention, not trends. Each piece is made to become part of your everyday
            life.
          </p>

          <div ref={ctaRef} className="mt-12 flex justify-center">
            <MotionLink
              href="/products"
              initial="rest"
              whileHover="hover"
              whileFocus="hover"
              className={`group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
            >
              <span className="relative pb-0.5">
                View All Products
                <motion.span
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent"
                  variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              </span>
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: 4 } }}
                transition={{ type: 'spring', stiffness: 150, damping: 22, mass: 0.4 }}
              >
                <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
              </motion.span>
            </MotionLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterTop;
