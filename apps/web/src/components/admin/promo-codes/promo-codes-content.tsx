'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminService } from '@/services/admin.service';
import { formatDate, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const promoSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(0.01, 'Value required'),
  usageLimit: z.number().min(1).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

type PromoForm = z.infer<typeof promoSchema>;

export function AdminPromoCodesContent() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'promo-codes'],
    queryFn: () => adminService.getPromoCodes({ limit: 50 }),
  });

  const { mutate: createPromoCode, isPending: isCreating } = useMutation({
    mutationFn: adminService.createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      toast.success('Promo code created');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create promo code'));
    },
  });

  const { mutate: togglePromoCode } = useMutation({
    mutationFn: adminService.togglePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      toast.success('Promo code updated');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to toggle promo code'));
    },
  });

  const { mutate: deletePromoCode, isPending: isDeleting } = useMutation({
    mutationFn: adminService.deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      toast.success('Promo code deleted');
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete promo code'));
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PromoForm>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      discountType: 'PERCENTAGE',
      isActive: true,
      discountValue: 0,
    },
  });

  const onSubmit = (data: PromoForm) => {
    createPromoCode({
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      usageLimit: data.usageLimit,
      isActive: data.isActive,
      expiresAt: data.expiresAt || undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-gold" />
          <div>
            <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
              Promo Codes
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {data?.promoCodes.length ?? 0} codes
            </p>
          </div>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Code
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Code
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Discount
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                Usage
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Expires
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4" colSpan={6}>
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : !data?.promoCodes || data.promoCodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No promo codes yet</p>
                </td>
              </tr>
            ) : (
              data.promoCodes.map((promo, index) => (
                <motion.tr
                  key={promo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-mono font-bold text-sm text-navy dark:text-white">
                      {promo.code}
                    </p>
                  </td>

                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-sm">
                      {promo.discountType === 'PERCENTAGE'
                        ? `${promo.discountValue}% off`
                        : `${formatPrice(promo.discountValue)} off`}
                    </span>
                  </td>

                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {promo.usageCount} / {promo.usageLimit ?? '∞'}
                    </span>
                  </td>

                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {promo.expiresAt
                        ? formatDate(promo.expiresAt)
                        : 'No expiry'}
                    </span>
                  </td>

                  <td className="p-4">
                    <Badge
                      className={
                        promo.isActive
                          ? 'bg-green-100 text-green-700 border-0'
                          : 'bg-gray-100 text-gray-700 border-0'
                      }
                    >
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => togglePromoCode(promo.id)}
                      >
                        {promo.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => setDeleteId(promo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair">
              Create Promo Code
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="SAVE20"
                {...register('code')}
                className="uppercase"
                onChange={(e) => setValue('code', e.target.value.toUpperCase())}
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watch('discountType')}
                  onValueChange={(val) =>
                    setValue('discountType', val as 'PERCENTAGE' | 'FIXED')
                  }
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE" className="cursor-pointer">
                      Percentage
                    </SelectItem>
                    <SelectItem value="FIXED" className="cursor-pointer">
                      Fixed Amount
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={
                    watch('discountType') === 'PERCENTAGE' ? '20' : '50'
                  }
                  {...register('discountValue', { valueAsNumber: true })}
                />
                {errors.discountValue && (
                  <p className="text-sm text-destructive">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usage Limit (optional)</Label>
                <Input
                  type="number"
                  placeholder="100"
                  {...register('usageLimit', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input type="date" {...register('expiresAt')} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                defaultChecked
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active immediately
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
                disabled={isCreating}
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
            <AlertDialogDescription>
              Cannot delete promo codes that have been used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              onClick={() => deleteId && deletePromoCode(deleteId)}
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
