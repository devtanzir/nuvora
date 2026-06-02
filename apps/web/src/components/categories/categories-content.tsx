'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesContent() {
  const { data: categories, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: productService.getCategories,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">
            Browse
          </p>
          <h1 className="text-4xl font-playfair font-bold text-navy dark:text-white">
            All Categories
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore our curated collection by category
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                >
                  <div className="group relative h-64 rounded-xl overflow-hidden border border-border hover:border-gold hover:shadow-lg transition-all duration-300 bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-6xl font-playfair font-bold text-muted-foreground/20">
                          {category.name.charAt(0)}
                        </p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-playfair font-bold text-lg">
                        {category.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-white/60 text-sm">
                          {category.productCount} products
                        </p>
                        <ArrowRight className="h-4 w-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
