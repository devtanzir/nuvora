'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '.animate-404',
        { opacity: 0, scale: 0.8, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)' }
      )
        .fromTo(
          '.animate-title',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.6'
        )
        .fromTo(
          '.animate-desc',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          '.animate-buttons',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        );

      gsap.to('.animate-glow', {
        scale: 1.1,
        opacity: 0.25,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-navy via-navy-light to-navy-dark px-4"
    >
      {/* Background Premium Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.15),transparent_70%)] opacity-20" />
      </div>

      <div className="text-center max-w-lg relative z-10 space-y-6">
        {/* Giant 404 Header */}
        <h1 className="animate-404 text-[120px] sm:text-[150px] font-playfair font-black text-gold tracking-tighter leading-none opacity-0 select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
          404
        </h1>

        {/* Error Details */}
        <div className="space-y-3">
          <h2 className="animate-title text-2xl sm:text-3xl font-playfair font-bold text-white opacity-0">
            Lost in the Aura?
          </h2>
          <p className="animate-desc text-white/60 text-base max-w-md mx-auto leading-relaxed opacity-0">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div className="animate-buttons flex flex-wrap items-center justify-center gap-4 pt-4 opacity-0">
          <Button
            size="lg"
            className="bg-gold hover:bg-gold-dark text-navy font-semibold px-6 h-12 rounded-full shadow-lg transition-transform active:scale-95"
            asChild
          >
            <Link href={ROUTES.HOME || '/'}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 h-12 rounded-full px-6 transition-transform active:scale-95"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
