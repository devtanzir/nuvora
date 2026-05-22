'use client';

import { cn } from '@/lib/utils';
import { ProductVariant } from '@/types/product.types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function ProductVariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) return null;

  // Group variants by name
  const grouped = variants.reduce<Record<string, ProductVariant[]>>(
    (acc, variant) => {
      if (!acc[variant.name]) acc[variant.name] = [];
      acc[variant.name].push(variant);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([name, variantGroup]) => (
        <div key={name} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-navy dark:text-white">
              {name}
            </p>
            {selectedVariant && selectedVariant.name === name && (
              <p className="text-sm text-muted-foreground">
                {selectedVariant.value}
                {selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                  <span className="text-warning ml-2">
                    Only {selectedVariant.stock} left
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {variantGroup.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isOutOfStock = variant.stock === 0;

              return (
                <button
                  key={variant.id}
                  onClick={() => !isOutOfStock && onSelect(variant)}
                  disabled={isOutOfStock}
                  className={cn(
                    'relative px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                    isSelected
                      ? 'border-gold bg-gold/10 text-navy dark:text-white ring-1 ring-gold'
                      : 'border-border hover:border-gold/50 text-foreground',
                    isOutOfStock &&
                      'opacity-40 cursor-not-allowed line-through',
                  )}
                >
                  {variant.value}
                  {isOutOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="sr-only">Out of stock</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
