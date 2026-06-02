'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export function RecentlyViewedSection() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-5 w-5 text-gold" />
          <div>
            <p className="text-gold text-sm font-medium tracking-widest uppercase">
              Continue Browsing
            </p>
            <h2 className="text-3xl font-playfair font-bold text-navy dark:text-white">
              Recently Viewed
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {items.map((product) => (
            <Link key={product.id} href={ROUTES.PRODUCT(product.slug)}>
              <div className="group space-y-2">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-gold/50 transition-all">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium line-clamp-1 group-hover:text-gold transition-colors">
                  {product.name}
                </p>
                <p className="text-xs font-bold text-navy dark:text-white">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
