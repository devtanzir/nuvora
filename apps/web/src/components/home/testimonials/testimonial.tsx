'use client';

import { useReducedMotion } from 'framer-motion';
import TestimonialHeader from './testimonial-header';
import FeaturedTestimonial from './featured-testimonial';
import ReviewCard from './review-card';
import TestimonialCta from './testimonial-cta';

const Testimonials = () => {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay },
        };

  return (
    <section
      aria-label="What people say about Nuvora"
      className="w-full bg-background py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[90rem] px-6 md:px-10">
        {/* Header */}
        <TestimonialHeader reveal={reveal} />

        {/* Featured testimonial */}
        <FeaturedTestimonial reveal={reveal}/>

        {/* Review cards */}
        <ReviewCard reduceMotion={reduceMotion} />

        {/* CTA */}
        <TestimonialCta reveal={reveal} />
      </div>
    </section>
  );
}

export default Testimonials
