import BrandValuesSection from '@/components/home/brand-value/brand-value';
import FeaturedCollection from '@/components/home/featured-collection/featured-collection';
import HeroSection from '@/components/home/hero/hero-section';
import { BannerSlider } from '@/components/product/banner-slider';
import { CategoriesSection } from '@/components/product/categories-section';
import { FeaturedProducts } from '@/components/product/featured-products';
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
      <BrandValuesSection />
      <FeaturedCollection/>
      <div className="container mx-auto px-4 py-8">
        <BannerSlider />
      </div>
      <CategoriesSection />
      <FeaturedProducts />
      <RecentlyViewedSection />
    </>
  );
}
