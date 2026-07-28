import { Product } from "@/types/product.types";
import { useEffect, useState } from "react";
import NewArrivalsSkeleton from "./new-arrivals-skeleton";
import HorizontalGallery from "./horizontal-gallery";
import VerticalStack from "./vertical-stack";

const NewArrivalsExperience = ({ products }: { products: Product[] }) => {
  const [isHorizontalLayout, setIsHorizontalLayout] = useState<boolean | null>(null);

  useEffect(() => {
    const widthQuery = window.matchMedia('(min-width: 768px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setIsHorizontalLayout(widthQuery.matches && !motionQuery.matches);
    update();

    widthQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    return () => {
      widthQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  if (isHorizontalLayout === null) return <NewArrivalsSkeleton />;

  return isHorizontalLayout ? <HorizontalGallery products={products} /> : <VerticalStack products={products} />;
}

export default NewArrivalsExperience
