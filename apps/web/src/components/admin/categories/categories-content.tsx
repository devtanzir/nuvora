'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { uploadService } from '@/services/upload.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { Category } from '@/types/product.types';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const categorySchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export function AdminCategoriesContent() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: adminService.getCategories,
  });

  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      toast.success('Category created');
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create category'));
    },
  });

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updateCategory>[1] }) =>
      adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      toast.success('Category updated');
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update category'));
    },
  });

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: adminService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      toast.success('Category deleted');
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete category'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  const handleOpen = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({ name: category.name, description: category.description ?? '' });
      setImageUrl(category.image ?? '');
    } else {
      setEditingCategory(null);
      reset({ name: '', description: '' });
      setImageUrl('');
    }
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    reset();
    setImageUrl('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { url } = await uploadService.uploadImage(file, 'categories');
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateCategory({
        id: editingCategory.id,
        data: { ...data, image: imageUrl || undefined },
      });
    } else {
      createCategory({ ...data, image: imageUrl || undefined });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-6 w-6 text-gold" />
          <div>
            <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
              Categories
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {categories?.length ?? 0} categories
            </p>
          </div>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          onClick={() => handleOpen()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-gold/50 transition-all"
            >
              {/* Image */}
              <div className="h-32 bg-muted relative">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                    onClick={() => handleOpen(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-white/20 hover:bg-destructive/80 text-white cursor-pointer"
                    onClick={() => setDeleteId(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm text-navy dark:text-white">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {category.productCount} products
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Electronics" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Category description..."
                rows={3}
                {...register('description')}
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              {imageUrl ? (
                <div className="relative h-32 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={imageUrl}
                    alt="Category image"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 text-xs cursor-pointer"
                    onClick={() => setImageUrl('')}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="h-24 rounded-lg border-2 border-dashed border-border hover:border-gold transition-colors flex flex-col items-center justify-center cursor-pointer gap-1">
                  {isUploadingImage ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Upload image
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? 'Save Changes' : 'Create'}
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
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Cannot delete category with active products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              onClick={() => deleteId && deleteCategory(deleteId)}
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
