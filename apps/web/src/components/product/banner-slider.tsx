'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bannerService } from '@/services/banner.service';
import { cn } from '@/lib/utils';

export function BannerSlider() {
  const [current, setCurrent] = useState(0);

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: bannerService.getActiveBanners,
  });

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-[21/6] bg-muted">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {banners[current].linkUrl ? (
            <Link href={banners[current].linkUrl!}>
              <Image
                src={banners[current].imageUrl}
                alt={banners[current].title}
                fill
                className="object-cover"
                priority
              />
            </Link>
          ) : (
            <Image
              src={banners[current].imageUrl}
              alt={banners[current].title}
              fill
              className="object-cover"
              priority
            />
          )}
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setCurrent((prev) => (prev + 1) % banners.length)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
