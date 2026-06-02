'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import { ProductVariant } from '@/types/product.types';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const variantSchema = z.object({
  name: z.string().min(1, 'Name required'),
  value: z.string().min(1, 'Value required'),
  stock: z.number().min(0),
  price: z.number().min(0.01).optional(),
});

type VariantForm = z.infer<typeof variantSchema>;

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState<number | undefined>(undefined);

  const { mutate: addVariant, isPending: isAddingVariant } = useMutation({
    mutationFn: (data: VariantForm) => adminService.addVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product'] });
      toast.success('Variant added');
      setIsAdding(false);
      reset();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to add variant'));
    },
  });

  const { mutate: updateVariant, isPending: isUpdatingVariant } = useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: { stock?: number; price?: number };
    }) => adminService.updateVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product'] });
      toast.success('Variant updated');
      setEditingId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update variant'));
    },
  });

  const { mutate: deleteVariant } = useMutation({
    mutationFn: (variantId: string) =>
      adminService.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product'] });
      toast.success('Variant deleted');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete variant'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VariantForm>({
    resolver: zodResolver(variantSchema),
    defaultValues: { name: 'Size', stock: 0 },
  });

  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-navy dark:text-white">
          Variants ({variants.length})
        </h2>
        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Variant
          </Button>
        )}
      </div>

      {/* Existing variants */}
      {variants.length > 0 ? (
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {variant.name}
                  </Badge>
                  <span className="text-sm font-medium">{variant.value}</span>
                </div>
              </div>

              {editingId === variant.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-20 h-7 text-xs"
                    placeholder="Stock"
                  />
                  <Input
                    type="number"
                    value={editPrice ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditPrice(val > 0 ? val : undefined);
                    }}
                    className="w-24 h-7 text-xs"
                    placeholder="Price (optional)"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-7 w-7 bg-green-600 hover:bg-green-700 cursor-pointer"
                    onClick={() =>
                      updateVariant({
                        variantId: variant.id,
                        data: { stock: editStock, price: editPrice },
                      })
                    }
                    disabled={isUpdatingVariant}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Stock: {variant.stock}
                  </span>
                  {variant.price && (
                    <span className="text-xs text-muted-foreground">
                      ${variant.price}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={() => {
                      setEditingId(variant.id);
                      setEditStock(variant.stock);
                      setEditPrice(variant.price ?? undefined);
                    }}
                  >
                    <Edit className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={() => deleteVariant(variant.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No variants yet.</p>
      )}

      {/* Add variant form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit((data) => addVariant(data))}
          className="space-y-3 p-3 rounded-lg border border-gold/30 bg-gold/5"
        >
          <p className="text-xs font-medium text-navy dark:text-white">
            New Variant
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                placeholder="Name (e.g. Size)"
                {...register('name')}
                className="h-8 text-xs"
              />
              {errors.name && (
                <p className="text-[10px] text-destructive mt-0.5">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Input
                placeholder="Value (e.g. XL)"
                {...register('value')}
                className="h-8 text-xs"
              />
              {errors.value && (
                <p className="text-[10px] text-destructive mt-0.5">
                  {errors.value.message}
                </p>
              )}
            </div>
            <Input
              type="number"
              placeholder="Stock"
              {...register('stock', { valueAsNumber: true })}
              className="h-8 text-xs"
            />
            <Input
              type="number"
              placeholder="Price (optional)"
              {...register('price', { valueAsNumber: true })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              className="bg-navy hover:bg-navy-light text-white cursor-pointer h-7 text-xs"
              disabled={isAddingVariant}
            >
              {isAddingVariant && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer h-7 text-xs"
              onClick={() => {
                setIsAdding(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
