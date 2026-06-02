'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/admin.service';
import { productService } from '@/services/product.service';
import { uploadService } from '@/services/upload.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';
import { VariantManager } from './variant-manager';

const productSchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price required'),
  originalPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1, 'Category required'),
  isActive: z.boolean().default(true),
  variants: z.array(
    z.object({
      name: z.string().min(1, 'Variant name required'),
      value: z.string().min(1, 'Variant value required'),
      stock: z.coerce.number().min(0),
      price: z.coerce.number().optional(),
    }),
  ).default([]),
});

type ProductForm = z.infer<typeof productSchema>;

interface ProductFormContentProps {
  productSlug?: string;
}

export function ProductFormContent({ productSlug }: ProductFormContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!productSlug;
  const [images, setImages] = useState<{ url: string; order: number; isPrimary: boolean }[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);



  // Fetch existing product if editing
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['admin', 'product', productSlug],
    queryFn: () => adminService.getProduct(productSlug!),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: productService.getCategories,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

    const categoryId = useWatch({ control, name: 'categoryId' });
  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        originalPrice: product.originalPrice ?? undefined,
        categoryId: product.category.id,
        isActive: product.isActive,
        variants: product.variants.map((v) => ({
          name: v.name,
          value: v.value,
          stock: v.stock,
          price: v.price ?? undefined,
        })),
      });
      setImages(
        product.images.map((img) => ({
          url: img.url,
          order: img.order,
          isPrimary: img.isPrimary,
        })),
      );
    }
  }, [product, reset]);

  // Mutations
  const { mutate: createProduct, isPending: isCreating } = useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created successfully');
      router.push(ROUTES.ADMIN_PRODUCTS);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create product'));
    },
  });

const { mutate: updateProduct, isPending: isUpdating } = useMutation({
  mutationFn: ({ slug, data }: { slug: string; data: Parameters<typeof adminService.updateProduct>[1] }) =>
    adminService.updateProduct(slug, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    toast.success('Product updated successfully');
    router.push(ROUTES.ADMIN_PRODUCTS);
  },
  onError: (error: unknown) => {
    toast.error(getErrorMessage(error, 'Failed to update product'));
  },
});

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadService.uploadImages(files, 'products');
      const newImages = uploaded.map((img, i) => ({
        url: img.url,
        order: images.length + i,
        isPrimary: images.length === 0 && i === 0,
      }));
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Re-assign primary
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated.map((img, i) => ({ ...img, order: i }));
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  };

  const onSubmit: SubmitHandler<ProductForm> = (data) => {
    if (images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    if (isEditing) {
      updateProduct({
        slug: productSlug,
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          categoryId: data.categoryId,
          isActive: data.isActive,
        },
      });
    } else {
      createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        categoryId: data.categoryId,
        images,
        variants: data.variants,
      });
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.ADMIN_PRODUCTS)}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4">
          <h2 className="font-medium text-navy dark:text-white">
            Basic Information
          </h2>

          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input placeholder="Premium Cotton Shirt" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Product description..."
              rows={4}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('price')}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Original Price (optional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('originalPrice')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              key={categoryId}
              value={categoryId}
              onValueChange={(val) => setValue('categoryId', val)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible to customers)
            </Label>
          </div>
        </div>

        {/* Images */}
 {/* Images */}
<div className="p-5 rounded-xl border border-border bg-card space-y-4">
  <h2 className="font-medium text-navy dark:text-white">Images</h2>

  {isEditing ? (
    // Edit mode - show existing images, no upload
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative">
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
              <Image
                src={img.url}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </div>
            {img.isPrimary && (
              <span className="absolute top-1 left-1 text-[10px] bg-gold text-navy px-1.5 py-0.5 rounded font-medium">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Image management for existing products will be available soon.
      </p>
    </div>
  ) : (
    // Create mode - full upload UI
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <div
              className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                img.isPrimary ? 'border-gold' : 'border-border'
              }`}
              onClick={() => setPrimary(index)}
            >
              <Image
                src={img.url}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </div>
            {img.isPrimary && (
              <span className="absolute top-1 left-1 text-[10px] bg-gold text-navy px-1.5 py-0.5 rounded font-medium">
                Primary
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-gold transition-colors flex flex-col items-center justify-center cursor-pointer gap-1">
          {isUploadingImage ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploadingImage}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Click an image to set as primary. Max 10 images.
      </p>
    </>
  )}
</div>

        {/* Variants - only for new products */}
        {!isEditing && (
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-navy dark:text-white">
                Variants (optional)
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: 'Size', value: '', stock: 0 })
                }
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No variants added. Product will use base stock.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-4 gap-3 items-end"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Size"
                        {...register(`variants.${index}.name`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        placeholder="XL"
                        {...register(`variants.${index}.value`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register(`variants.${index}.stock`)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="cursor-pointer text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

{isEditing && product && (
  <VariantManager
    productId={product.id}
    variants={product.variants}
  />
)}
        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.ADMIN_PRODUCTS)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
            disabled={isCreating || isUpdating}
          >
            {(isCreating || isUpdating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
