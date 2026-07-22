import { Product } from "@/types/product.types";
import { CARD_HOVER_SCALE_CLASS, DURATION, EASE_CLASS, EASE_PREMIUM, IMAGE_TRANSITION_CLASS, SIZE_STYLES } from "../constants/featured-collection";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CardSize } from "../types/featured-collection";

const CollectionCard = ({
  product,
  index,
  size = 'default',
  className = '',
}: {
  product: Product;
  index: number;
  size?: CardSize;
  className?: string;
}) => {
  const styles = SIZE_STYLES[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: DURATION.slow,
        delay: index * 0.08,
        ease: EASE_PREMIUM,
      }}
      className={className}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group relative block h-full w-full overflow-hidden bg-primary/10"
      >
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
            style={{ objectPosition: '50% 22%' }}
            className={`object-cover ${CARD_HOVER_SCALE_CLASS} transition-[transform,filter] ${IMAGE_TRANSITION_CLASS} group-hover:brightness-[1.03]`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/50">
              No Image
            </span>
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent transition-opacity duration-500 ${EASE_CLASS} group-hover:opacity-90`}
          aria-hidden="true"
        />

        {/* Overlaid content */}
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 ${styles.padding}`}>
          <div className="flex flex-col gap-1.5">
            <span className={`tracking-wide uppercase text-accent ${styles.eyebrow}`}>
              {product.category.name}
            </span>
            <h3 className={`font-heading leading-snug text-primary-foreground  ${styles.heading}`}>
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-3.5">
            <span
              className={`font-normal uppercase tracking-[0.25em] text-primary-foreground/75 transition-colors duration-300 ${EASE_CLASS} group-hover:text-primary-foreground ${styles.cta}`}
            >
              Discover
            </span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/40 text-primary-foreground transition-colors duration-300 ${EASE_CLASS} group-hover:border-primary group-hover:bg-primary group-hover:text-muted`}
              aria-hidden="true"
            >
              <ArrowRight
                className={`h-3.5 w-3.5 transition-transform duration-300 ${EASE_CLASS} group-hover:translate-x-0.5`}
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default CollectionCard;
