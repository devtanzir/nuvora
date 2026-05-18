'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import HeroImage from "../../../public/hero-image.webp"

const STATS = [
  { value: '500+', label: 'Products' },
  { value: '50K+', label: 'Customers' },
  { value: '4.9★', label: 'Rating' },
] as const;

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 },
      )
        .fromTo(
          subheadingRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6',
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4',
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3',
        )
        .fromTo(
          imageRef.current,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 1.2 },
          '-=1.4',
        );

      gsap.to(scrollRef.current, {
        y: 10,
        opacity: 0.2,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[95vh] flex items-center overflow-hidden bg-linear-to-br from-navy via-navy-light to-navy-dark"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(27,45,79,0.8),transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center py-24 relative z-10">
        {/* Left content */}
        <div className="space-y-10 text-white">
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse"
                aria-hidden="true"
              />
              <p className="text-gold text-xs font-medium tracking-widest uppercase">
                New Collection 2026
              </p>
            </div>

            {/* Heading */}
            <h1
              ref={headingRef}
              className="text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold leading-[1.1] opacity-0"
            >
              Elevate Your{' '}
              <span className="text-gold">Style,</span>
              <br />
              <span className="text-white/80">Define Your</span>{' '}
              <span className="text-gold">Aura</span>
            </h1>

            {/* Subheading */}
            <p
              ref={subheadingRef}
              className="text-white/60 text-lg max-w-md leading-relaxed opacity-0"
            >
              Discover premium fashion curated for the modern individual.
              Where luxury meets everyday elegance.
            </p>
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8 h-12 rounded-full"
              asChild
            >
              <Link href={ROUTES.PRODUCTS}>
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-navy dark:text-white hover:bg-white/10 h-12 rounded-full px-8"
              asChild
            >
              <Link href={ROUTES.CATEGORIES}>Explore Categories</Link>
            </Button>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="flex gap-10 pt-2 opacity-0">
            {STATS.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl font-playfair font-bold text-gold">
                  {stat.value}
                </p>
                <p className="text-white/40 text-xs tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right image */}
        <div ref={imageRef} className="relative hidden lg:block opacity-0">
          <div className="relative h-[580px] w-full rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0 bg-linear-to-br from-gold/10 via-transparent to-navy/50 z-10 rounded-3xl"
              aria-hidden="true"
            />
            <Image
              src={HeroImage}
              width={600}
              height={580}
              alt="Nuvora Fashion - Premium Collection"
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Floating card - New Arrivals */}
          <div className="absolute -bottom-4 -left-8 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl z-20 min-w-[180px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-gold" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">
                  New Arrivals
                </p>
                <p className="text-white font-playfair font-bold text-sm">
                  Summer Collection
                </p>
              </div>
            </div>
            <p className="text-gold font-bold text-lg text-center">
              From $29.99
            </p>
          </div>

          {/* Floating badge - Rating */}
          <div className="absolute top-8 -right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl z-20">
            <div className="flex items-center gap-2">
              <Star
                className="h-4 w-4 fill-gold text-gold"
                aria-hidden="true"
              />
              <div>
                <p className="text-white font-bold text-sm">4.9/5</p>
                <p className="text-white/50 text-[10px]">50K+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </p>
        <div ref={scrollRef} className="flex flex-col items-center gap-1">
          <div className="h-6 w-px bg-linear-to-b from-white/50 to-transparent" />
          <div className="h-1 w-1 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
