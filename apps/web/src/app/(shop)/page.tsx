import { BannerSlider } from '@/components/product/banner-slider';
import { CategoriesSection } from '@/components/product/categories-section';
import { FeaturedProducts } from '@/components/product/featured-products';
import { HeroSection } from '@/components/product/hero-section';
import { RecentlyViewedSection } from '@/components/product/recently-viewed-section';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Nuvora | Premium Fashion',
  description: 'Discover premium fashion curated for the modern individual.',
};

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
