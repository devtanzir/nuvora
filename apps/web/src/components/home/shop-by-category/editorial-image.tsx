import { Category } from "@/types/product.types";
import { motion } from "framer-motion";
import Link from "next/link";
import { TextScale } from "../types/shop-category";
import { ARROW_HOVER_VARIANTS, CTA_HOVER_VARIANTS, GRADIENT_HOVER_VARIANTS, HOVER_SPRING, IMAGE_HOVER_VARIANTS, TEXT_SCALE_STYLES, TITLE_HOVER_VARIANTS } from "../constants/shop-category";
import useScrollReveal from "../hooks/useScrollReveal";
import useScrollParallax from "../hooks/useScrollParallax";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const MotionLink = motion(Link);

function EditorialImage({
  category,
  index,
  textScale,
  sizes,
  className = '',
}: {
  category: Category;
  index: number;
  textScale: TextScale;
  sizes: string;
  className?: string;
}) {
  const styles = TEXT_SCALE_STYLES[textScale];

  const revealRef = useScrollReveal<HTMLDivElement>(index);
  const parallaxRef = useScrollParallax<HTMLDivElement>();

  return (
    <div ref={revealRef} className={`invisible ${className}`}>
      <MotionLink
        href={`/categories/${category.slug}`}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        className="group relative block h-full w-full overflow-hidden bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {category.image ? (
          <div className="absolute -inset-y-6 inset-x-0 overflow-hidden">
            <div ref={parallaxRef} className="absolute inset-0">
              <motion.div
                className="relative h-full w-full"
                variants={IMAGE_HOVER_VARIANTS}
                transition={HOVER_SPRING}
              >
                <Image
                  src={category.image}
                  alt={`${category.name} collection`}
                  fill
                  sizes={sizes}
                  className="object-cover object-center"
                />
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/50">
              No Image
            </span>
          </div>
        )}

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/55 via-primary/5 to-transparent"
          variants={GRADIENT_HOVER_VARIANTS}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        />

        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-start gap-2.5 ${styles.padding}`}>
          <motion.h3
            className={`font-heading leading-snug text-primary-foreground ${styles.heading}`}
            variants={TITLE_HOVER_VARIANTS}
            transition={HOVER_SPRING}
          >
            {category.name}
          </motion.h3>

          <motion.div
            className="flex items-center gap-3"
            variants={CTA_HOVER_VARIANTS}
            transition={{ duration: 0.4 }}
          >
            <span
              className={`font-normal uppercase tracking-[0.25em] text-primary-foreground/80 ${styles.label}`}
            >
              Explore Collection
            </span>
            <motion.span variants={ARROW_HOVER_VARIANTS} transition={HOVER_SPRING}>
              <ArrowRight className="h-3.5 w-3.5 text-primary-foreground/80" aria-hidden="true" />
            </motion.span>
          </motion.div>
        </div>
      </MotionLink>
    </div>
  );
}

export default EditorialImage
