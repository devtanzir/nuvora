import { Product } from "@/types/product.types";
import { motion } from "framer-motion";
import Link from "next/link";
import { ARROW_VARIANTS, HOVER_SPRING, IMAGE_HOVER_VARIANTS, UNDERLINE_VARIANTS } from "../constants/new-arrivals";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const MotionLink = motion(Link);
const VerticalCard = ({ product }: { product: Product }) => {
  return (
    <MotionLink
      href={`/products/${product.slug}`}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      className="group relative block aspect-[4/5] w-full overflow-hidden bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      {product.primaryImage ? (
        <motion.div className="relative h-full w-full" variants={IMAGE_HOVER_VARIANTS} transition={HOVER_SPRING}>
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-xs uppercase tracking-widest text-muted-foreground/50">No Image</span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/50 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 p-7">
        <span className="text-[11px] uppercase tracking-[0.25em] text-primary-foreground/75">
          {product.category.name}
        </span>
        <h3 className="font-heading text-2xl leading-snug text-primary-foreground">{product.name}</h3>
        <div className="mt-1.5 flex items-center gap-4">
          <span className="text-sm text-primary-foreground/90">${product.price.toFixed(2)}</span>
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary-foreground/75">
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
  );
}

export default VerticalCard;
