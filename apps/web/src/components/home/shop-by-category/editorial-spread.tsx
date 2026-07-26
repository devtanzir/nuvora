import { Category } from "@/types/product.types";
import { CURATED_ORDER, EASE_CLASS } from "../constants/shop-category";
import useScrollReveal from "../hooks/useScrollReveal";
import EditorialImage from "./editorial-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const EditorialSpread = ({
  bySlug,
  viewAllHref,
}: {
  bySlug: Partial<Record<(typeof CURATED_ORDER)[number], Category>>;
  viewAllHref: string;
}) => {
  const { shirts, dresses, tops, accessories, boots, backpacks } = bySlug;
  const closingRef = useScrollReveal<HTMLDivElement>(6);

  return (
    <div className="flex flex-col gap-10 md:gap-15 xl:gap-16">
      {/* Movement 1 - large feature + offset companion image */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-6">
        {shirts && (
          <EditorialImage
            category={shirts}
            index={0}
            textScale="feature"
            sizes="(min-width: 640px) 66vw, 100vw"
            className="sm:col-span-8 aspect-[4/5] sm:aspect-auto sm:h-[560px] xl:h-[640px]"
          />
        )}
        {dresses && (
          <EditorialImage
            category={dresses}
            index={1}
            textScale="medium"
            sizes="(min-width: 640px) 33vw, 100vw"
            className="sm:col-span-4 aspect-[4/5] sm:aspect-auto sm:h-[420px] sm:self-end xl:h-[460px]"
          />
        )}
      </div>

      {/* Movement 2 - wide landscape breather, full width */}
      {tops && (
        <EditorialImage
          category={tops}
          index={2}
          textScale="wide"
          sizes="100vw"
          className="aspect-[16/10] sm:aspect-auto sm:h-[380px] xl:h-[440px]"
        />
      )}

      {/* Movement 3 - two portraits, deliberately offset, generous gap between */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-10 xl:gap-16">
        {accessories && (
          <EditorialImage
            category={accessories}
            index={3}
            textScale="medium"
            sizes="(min-width: 640px) 41vw, 100vw"
            className="sm:col-span-5 aspect-[4/5] sm:aspect-auto sm:h-[560px] xl:h-[620px]"
          />
        )}
        {boots && (
          <EditorialImage
            category={boots}
            index={4}
            textScale="medium"
            sizes="(min-width: 640px) 41vw, 100vw"
            className="sm:col-span-5 sm:col-start-8 aspect-[4/5] sm:aspect-auto sm:h-[560px] sm:mt-16 xl:h-[620px] xl:mt-24"
          />
        )}
      </div>

      {/* Movement 4 - closing feature paired with the editorial sign-off */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-12 sm:items-center sm:gap-8">
        {backpacks && (
          <EditorialImage
            category={backpacks}
            index={5}
            textScale="medium"
            sizes="(min-width: 640px) 58vw, 100vw"
            className="sm:col-span-7 aspect-[4/5] sm:aspect-auto sm:h-[480px] xl:h-[540px]"
          />
        )}

        <div ref={closingRef} className="invisible flex flex-col items-start gap-6 sm:col-span-5">
          <h3 className="font-heading text-4xl leading-[1.15] text-primary xl:text-[2.75rem]">
            The Complete Edit
          </h3>
          <p className="max-w-[32ch] text-sm text-muted-foreground md:text-base">
            Every category, one considered wardrobe. Explore the full range beyond these six.
          </p>
          <Link
            href={viewAllHref}
            className={`group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-primary transition-colors duration-300 ${EASE_CLASS}`}
          >
            <span
              className={`border-b border-primary/30 pb-0.5 transition-colors duration-300 ${EASE_CLASS} group-hover:border-accent/60 group-hover:text-accent`}
            >
              View All Categories
            </span>
            <ArrowRight
              className={`h-4 w-4 text-accent transition-transform duration-300 ${EASE_CLASS} group-hover:translate-x-1`}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EditorialSpread
