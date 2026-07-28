import { Product } from "@/types/product.types";
import { HEADER_OFFSET} from "../constants/new-arrivals";
import GalleryCard from "./gallery-card";
import ClosingPanel from "./closing-panel";
import useHorizontalGallery from "../hooks/useHorizontalGallery";

const HorizontalGallery = ({ products }: { products: Product[] }) => {

  const {
    sectionRef,
    backgroundRef,
    progressRef,
    panelCount,
    trackRef,
    cardRefs,
    imageWrapRefs,
    textGroupRefs,
  } = useHorizontalGallery(products)

  return (
    <section
      ref={sectionRef}
      aria-label="New Arrivals gallery"
      className="relative min-h-screen w-full overflow-hidden bg-background"
      style={{ paddingTop: HEADER_OFFSET }}
    >
      <div className="relative h-full w-full">
        <div
          ref={backgroundRef}
          className="absolute inset-0 bg-background will-change-transform"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute bottom-10 right-6 z-10 flex flex-col items-end gap-2 md:bottom-14 md:right-12"
          aria-hidden="true"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/50">New Arrivals</span>
          <div className="flex items-baseline gap-3">
            <span
              ref={progressRef}
              className="text-[13px] font-normal tabular-nums tracking-[0.15em] text-primary/60"
            >
              01
            </span>
            <span className="h-px w-6 bg-primary/25" />
            <span className="text-[11px] font-normal tabular-nums tracking-[0.15em] text-primary/35">
              {String(panelCount).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex h-full items-center gap-x-[5vw] pl-[12vw] pr-[14vw] will-change-transform lg:gap-x-[6vw] lg:pl-[15vw] lg:pr-[18vw]"
        >
          {products.map((product, i) => (
            <GalleryCard
              key={product.id}
              product={product}
              setCardRef={(el) => (cardRefs.current[i] = el)}
              setImageWrapRef={(el) => (imageWrapRefs.current[i] = el)}
              setTextGroupRef={(els) => (textGroupRefs.current[i] = els)}
            />
          ))}

          <ClosingPanel
            setCardRef={(el) => (cardRefs.current[products.length] = el)}
            setTextGroupRef={(els) => (textGroupRefs.current[products.length] = els)}
          />
        </div>
      </div>
    </section>
  );
}

export default HorizontalGallery
