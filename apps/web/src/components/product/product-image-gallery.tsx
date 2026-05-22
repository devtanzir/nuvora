'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/types/product.types';
import { ShoppingBag } from 'lucide-react';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleSelect = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (activeIndex > 0) handleSelect(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < images.length - 1) handleSelect(activeIndex + 1);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex].url}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              className="object-cover"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-4 w-4 text-white" />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/80 rounded-full p-2 shadow-md transition-all',
                activeIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-0 group-hover:opacity-100 hover:scale-110',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === images.length - 1}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/80 rounded-full p-2 shadow-md transition-all',
                activeIndex === images.length - 1
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-0 group-hover:opacity-100 hover:scale-110',
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === activeIndex
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleSelect(index)}
              className={cn(
                'relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200',
                index === activeIndex
                  ? 'border-gold shadow-md scale-105'
                  : 'border-border hover:border-gold/50',
              )}
            >
              <Image
                src={image.url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
