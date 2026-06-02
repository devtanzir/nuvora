import { BannerSlider } from '@/components/product/banner-slider';
import { CategoriesSection } from '@/components/product/categories-section';
import { FeaturedProducts } from '@/components/product/featured-products';
import { HeroSection } from '@/components/product/hero-section';
import { RecentlyViewedSection } from '@/components/product/recently-viewed-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <BannerSlider />
      </div>
      <CategoriesSection />
      <FeaturedProducts />
      <RecentlyViewedSection />
    </>
  );
}
