import { Product } from "@/types/product.types";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ARROW_VARIANTS, HOVER_SPRING, IMAGE_HOVER_VARIANTS, UNDERLINE_VARIANTS } from "../constants/new-arrivals";
import { ArrowRight } from "lucide-react";

const MotionLink = motion(Link);

const GalleryCard = ({
  product,
  setCardRef,
  setImageWrapRef,
  setTextGroupRef,
}: {
  product: Product;
  setCardRef: (el: HTMLDivElement | null) => void;
  setImageWrapRef: (el: HTMLDivElement | null) => void;
  setTextGroupRef: (els: (HTMLElement | null)[]) => void;
}) => {
  const categoryRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setTextGroupRef([categoryRef.current, titleRef.current, priceRef.current, ctaRef.current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={setCardRef}
      className="relative h-[82vh] w-[70vw] shrink-0 will-change-transform sm:w-[58vw] md:w-[52vw] lg:h-[85vh] lg:w-[48vw]"
    >
      <MotionLink
        href={`/products/${product.slug}`}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        className="group relative block h-full w-full overflow-hidden bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div ref={setImageWrapRef} className="absolute inset-0 will-change-transform">
          {product.primaryImage ? (
            <motion.div className="relative h-full w-full" variants={IMAGE_HOVER_VARIANTS} transition={HOVER_SPRING}>
              <Image
                src={product.primaryImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 48vw, 70vw"
                className="object-cover object-center"
              />
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground/50">No Image</span>
            </div>
          )}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/50 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 p-8 md:p-10">
          <span
            ref={categoryRef}
            className="text-[11px] uppercase tracking-[0.25em] text-primary-foreground/75"
          >
            {product.category.name}
          </span>
          <h3 ref={titleRef} className="font-heading text-2xl leading-snug text-primary-foreground md:text-3xl">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-4">
            <span ref={priceRef} className="text-sm text-primary-foreground/90">
              ${product.price.toFixed(2)}
            </span>
            <span
              ref={ctaRef}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary-foreground/75"
            >
              <span className="relative pb-0.5">
                View Piece
                <motion.span
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent"
                  variants={UNDERLINE_VARIANTS}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              </span>
              <motion.span variants={ARROW_VARIANTS} transition={HOVER_SPRING}>
                <ArrowRight className="h-3 w-3 text-accent" aria-hidden="true" />
              </motion.span>
            </span>
          </div>
        </div>
      </MotionLink>
    </div>
  );
}

export default GalleryCard;
