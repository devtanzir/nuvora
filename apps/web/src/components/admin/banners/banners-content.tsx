'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ImageIcon, Plus, Edit, Trash2, Loader2, Upload, Eye, EyeOff } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminService, Banner } from '@/services/admin.service';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const bannerSchema = z.object({
  title: z.string().min(2, 'Title required'),
  linkUrl: z.string().optional(),
  isActive: z.boolean(),
});

type BannerForm = z.infer<typeof bannerSchema>;

export function AdminBannersContent() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: adminService.getBanners,
  });

  const { mutate: createBanner, isPending: isCreating } = useMutation({
    mutationFn: adminService.createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Banner created');
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create banner'));
    },
  });

  const { mutate: updateBanner, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updateBanner>[1] }) =>
      adminService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Banner updated');
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update banner'));
    },
  });

  const { mutate: deleteBanner, isPending: isDeleting } = useMutation({
    mutationFn: adminService.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Banner deleted');
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete banner'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { isActive: true },
  });

  const handleOpen = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      reset({
        title: banner.title,
        linkUrl: banner.linkUrl ?? '',
        isActive: banner.isActive,
      });
      setImageUrl(banner.imageUrl);
    } else {
      setEditingBanner(null);
      reset({ title: '', linkUrl: '', isActive: true });
      setImageUrl('');
    }
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    reset();
    setImageUrl('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { url } = await uploadService.uploadImage(file, 'banners');
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = (data: BannerForm) => {
    if (!imageUrl) {
      toast.error('Banner image is required');
      return;
    }

    if (editingBanner) {
      updateBanner({
        id: editingBanner.id,
        data: {
          title: data.title,
          imageUrl,
          linkUrl: data.linkUrl || undefined,
          isActive: data.isActive,
        },
      });
    } else {
      createBanner({
        title: data.title,
        imageUrl,
        linkUrl: data.linkUrl || undefined,
        isActive: data.isActive,
        order: (banners?.length ?? 0) + 1,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-6 w-6 text-gold" />
          <div>
            <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
              Banners
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {banners?.length ?? 0} banners
            </p>
          </div>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          onClick={() => handleOpen()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Banners Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : !banners || banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ImageIcon className="h-16 w-16 text-muted-foreground/20" />
          <p className="text-muted-foreground">No banners yet</p>
          <Button
            variant="outline"
            onClick={() => handleOpen()}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-xl border border-border overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-muted">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                    onClick={() => handleOpen(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                    onClick={() =>
                      updateBanner({
                        id: banner.id,
                        data: { isActive: !banner.isActive },
                      })
                    }
                  >
                    {banner.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-white/20 hover:bg-destructive/80 text-white cursor-pointer"
                    onClick={() => setDeleteId(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-navy dark:text-white">
                    {banner.title}
                  </p>
                  {banner.linkUrl && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {banner.linkUrl}
                    </p>
                  )}
                </div>
                <Badge
                  className={
                    banner.isActive
                      ? 'bg-green-100 text-green-700 border-0'
                      : 'bg-gray-100 text-gray-700 border-0'
                  }
                >
                  {banner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Summer Sale — Up to 50% Off" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link URL (optional)</Label>
              <Input
                placeholder="/products?sale=true"
                {...register('linkUrl')}
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              {imageUrl ? (
                <div className="relative h-40 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={imageUrl}
                    alt="Banner preview"
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
                <label className="h-32 rounded-lg border-2 border-dashed border-border hover:border-gold transition-colors flex flex-col items-center justify-center cursor-pointer gap-1">
                  {isUploadingImage ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Upload banner image
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Recommended: 1920×600px
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

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bannerIsActive"
                {...register('isActive')}
                defaultChecked
                className="h-4 w-4"
              />
              <Label htmlFor="bannerIsActive" className="cursor-pointer">
                Active (visible on homepage)
              </Label>
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
                {editingBanner ? 'Save Changes' : 'Create Banner'}
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
            <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              This banner will be permanently removed from the homepage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              onClick={() => deleteId && deleteBanner(deleteId)}
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
