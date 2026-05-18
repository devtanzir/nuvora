'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export function CategoriesSection() {
  const { data: categories, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: productService.getCategories,
  });
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">
              Browse
            </p>
            <h2 className="text-4xl font-playfair font-bold text-navy dark:text-white">
              Shop by Category
            </h2>
          </div>
          <Link
            href={ROUTES.CATEGORIES}
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))
            : categories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={ROUTES.CATEGORY(category.slug)}>
                    <div className="group relative h-48 rounded-xl overflow-hidden bg-linear-to-br from-navy/5 to-navy/10 dark:from-navy/20 dark:to-navy/40 border border-border hover:border-gold transition-all duration-300">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          height={500}
                          width={500}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-4xl font-playfair font-bold text-navy/20 dark:text-white/10">
                            {category.name.charAt(0)}
                          </p>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-navy/80 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-medium">
                          {category.name}
                        </p>
                        <p className="text-white/60 text-xs">
                          {category.productCount} products
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
