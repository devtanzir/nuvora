import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ARROW_VARIANTS, HOVER_SPRING, UNDERLINE_VARIANTS } from "../constants/new-arrivals";
import { ArrowRight } from "lucide-react";

const MotionLink = motion(Link);

const ClosingPanel = ({
  setCardRef,
  setTextGroupRef,
}: {
  setCardRef: (el: HTMLDivElement | null) => void;
  setTextGroupRef: (els: (HTMLElement | null)[]) => void;
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTextGroupRef([bodyRef.current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={setCardRef}
      className="relative flex h-[82vh] w-[85vw] shrink-0 items-center justify-center px-10 will-change-transform lg:h-[85vh] lg:w-[64vw]"
    >
      <div ref={bodyRef} className="max-w-xl text-center">
        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60">The Season, In Full</span>
        <h3 className="mt-5 font-heading text-4xl leading-[1.2] text-primary md:text-5xl">
          Explore
          <br />
          The Entire Collection
        </h3>
        <p className="mx-auto mt-6 max-w-[38ch] text-sm text-muted-foreground md:text-base">
          Discover every product curated for the season.
        </p>
        <div className="mt-10 flex justify-center">
          <MotionLink
            href="/products"
            initial="rest"
            whileHover="hover"
            whileFocus="hover"
            className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span className="relative pb-0.5">
              View All Products
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
      </div>
    </div>
  );
}

export default ClosingPanel;
