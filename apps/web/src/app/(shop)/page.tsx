import BrandPhilosophy from '@/components/home/brand-philosophy/brand-philosophy';
import BrandValuesSection from '@/components/home/brand-value/brand-value';
import EditorialPause from '@/components/home/editorial-campaign/editorial-campaign';
import FeaturedCollection from '@/components/home/featured-collection/featured-collection';
import HeroSection from '@/components/home/hero/hero-section';
import NewArrivals from '@/components/home/new-arrivals/new-arrivals';
import Newsletter from '@/components/home/newsletter/newsletter';
import ShopByCategory from '@/components/home/shop-by-category/shop-by-category';
import Testimonials from '@/components/home/testimonials/testimonial';
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
      <ShopByCategory/>
      <EditorialPause/>
      <NewArrivals/>
      <BrandPhilosophy/>
      <Testimonials/>
      <Newsletter/>
    </>
  );
}
