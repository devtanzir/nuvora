'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

export function AdminProductsContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', { search: debouncedSearch, page }],
    queryFn: () =>
      adminService.getProducts({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
      }),
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted');
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete product'));
    },
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.toggleProductStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product status updated');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Products
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta.total ?? 0} total products
          </p>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          asChild
        >
          <Link href={ROUTES.ADMIN_PRODUCT_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Product
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                Category
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Price
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Stock
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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4" colSpan={6}>
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : data?.products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No products found</p>
                </td>
              </tr>
            ) : (
              data?.products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Product */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{product.id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {product.category.name}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-sm font-medium">
                      {formatPrice(product.price)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="p-4 hidden lg:table-cell">
                    <Badge
                      className={
                        product.stock === 0
                          ? 'bg-red-100 text-red-700 border-0'
                          : product.stock <= 10
                            ? 'bg-yellow-100 text-yellow-700 border-0'
                            : 'bg-green-100 text-green-700 border-0'
                      }
                    >
                      {product.stock === 0
                        ? 'Out of Stock'
                        : `${product.stock} units`}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <Badge
                      className={
                        product.isActive
                          ? 'bg-green-100 text-green-700 border-0'
                          : 'bg-gray-100 text-gray-700 border-0'
                      }
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() =>
                          toggleStatus({
                            id: product.id,
                            isActive: !product.isActive,
                          })
                        }
                      >
                        {product.isActive ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        asChild
                      >
                        <Link href={`/admin/products/${product.slug}`}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => setDeleteId(product.id)}
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

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.meta.totalPages}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the product. It won&apos;t be visible to
              customers but can be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              onClick={() => deleteId && deleteProduct(deleteId)}
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
