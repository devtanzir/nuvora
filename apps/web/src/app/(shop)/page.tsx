import { CategoriesSection } from "@/components/product/categories-section";
import { FeaturedProducts } from "@/components/product/featured-products";
import { HeroSection } from "@/components/product/hero-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
    </>
  );
}
