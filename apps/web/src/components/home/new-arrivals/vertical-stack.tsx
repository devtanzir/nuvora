import { Product } from "@/types/product.types";
import VerticalCard from "./vertical-card";
import { motion } from "framer-motion";
import Link from "next/link";
import { ARROW_VARIANTS, HOVER_SPRING, UNDERLINE_VARIANTS } from "../constants/new-arrivals";
import { ArrowRight } from "lucide-react";

const MotionLink = motion(Link);

const VerticalStack = ({ products }: { products: Product[] }) => {
  return (
    <section aria-label="New Arrivals" className="w-full bg-background py-20">
      <div className="mx-auto max-w-[90rem] px-6">
        <div className="flex flex-col gap-14">
          {products.map((product) => (
            <VerticalCard key={product.id} product={product} />
          ))}

          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <h3 className="font-heading text-3xl leading-[1.2] text-primary">
              Explore
              <br />
              The Entire Collection
            </h3>
            <p className="max-w-[32ch] text-sm text-muted-foreground">
              Discover every product curated for the season.
            </p>
            <MotionLink
              href="/products"
              initial="rest"
              whileHover="hover"
              whileFocus="hover"
              className="group mt-2 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
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
    </section>
  );
}

export default VerticalStack
