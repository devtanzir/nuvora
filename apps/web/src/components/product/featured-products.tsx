'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from './product-card';

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS({ limit: 8, sortBy: 'newest' }),
    queryFn: () => productService.getProducts({ limit: 8, sortBy: 'newest' }),
  });

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">
              Featured
            </p>
            <h2 className="text-4xl font-playfair font-bold text-navy dark:text-white">
              New Arrivals
            </h2>
          </div>
          <Link
            href={ROUTES.PRODUCTS}
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))
            : data?.products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
