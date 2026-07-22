import Link from 'next/link';
import { EASE_CLASS, HOTSPOT } from '../constants/hero-constants';
import { ArrowRight } from 'lucide-react';
import { motion, MotionValue } from 'framer-motion';

const HeroHotspot = ({
  hotspotX,
  hotspotY,
}: {
  hotspotX: MotionValue<number>;
  hotspotY: MotionValue<number>;
}) => {
  return (
    <>
      <motion.div
        style={{ x: hotspotX, y: hotspotY }}
        className="absolute bottom-6 left-6 md:bottom-8 md:left-8"
      >
        <Link
          href="/products/relaxed-linen-shirt"
          className={`group flex items-center gap-3 border border-border bg-background px-4 py-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.15)] transition-colors duration-300 ${EASE_CLASS} hover:bg-background/95`}
        >
          <span className="flex flex-col">
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-accent">
              {HOTSPOT.eyebrow}
            </span>
            <span className="font-heading text-sm muted-foreground transition-colors duration-300">
              {HOTSPOT.label}
            </span>
          </span>
          <span
            className={`ml-2 flex items-center gap-1 border-l border-border pl-3 text-xs font-medium text-accent transition-colors duration-300`}
          >
            {HOTSPOT.cta}
            <ArrowRight
              className={`h-3 w-3 transition-transform duration-200 ${EASE_CLASS} group-hover:translate-x-1`}
            />
          </span>
        </Link>
      </motion.div>
    </>
  );
};

export default HeroHotspot;
