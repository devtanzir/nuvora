'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { QUERY_KEYS } from '@/constants/query-keys';
import { formatPrice, formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

export function AdminUsersContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toggleUserId, setToggleUserId] = useState<string | null>(null);
  const [toggleUserActive, setToggleUserActive] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_USERS({ search: debouncedSearch, page }),
    queryFn: () =>
      adminService.getUsers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
      }),
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateUserStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN_USERS(),
      });
      toast.success(
        variables.isActive ? 'User activated' : 'User deactivated',
      );
      setToggleUserId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update user'));
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-gold" />
        <div>
          <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Users
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ?? 0} registered users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
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
                User
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                Role
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Orders
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Spent
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Joined
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
                  <td className="p-4" colSpan={7}>
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : !data?.users || data.users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No users found</p>
                </td>
              </tr>
            ) : (
              data.users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user.avatar ?? ''} />
                        <AvatarFallback className="bg-navy text-white text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 hidden md:table-cell">
                    <Badge
                      className={
                        user.role === 'ADMIN'
                          ? 'bg-gold text-navy border-0'
                          : 'bg-muted text-muted-foreground border-0'
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>

                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm">{user.totalOrders}</span>
                  </td>

                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm">
                      {formatPrice(user.totalSpent)}
                    </span>
                  </td>

                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>

                  <td className="p-4">
                    <Badge
                      className={
                        user.isActive
                          ? 'bg-green-100 text-green-700 border-0'
                          : 'bg-red-100 text-red-700 border-0'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end">
                      {user.role !== 'ADMIN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'cursor-pointer text-xs',
                            user.isActive
                              ? 'text-destructive hover:text-destructive'
                              : 'text-green-600 hover:text-green-600',
                          )}
                          onClick={() => {
                            setToggleUserId(user.id);
                            setToggleUserActive(!user.isActive);
                          }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
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

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!toggleUserId}
        onOpenChange={(open) => !open && setToggleUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleUserActive ? 'Activate User?' : 'Deactivate User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleUserActive
                ? 'This user will be able to login and use the platform.'
                : 'This user will not be able to login until reactivated.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                'cursor-pointer',
                toggleUserActive
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive hover:bg-destructive/90',
              )}
              onClick={() =>
                toggleUserId &&
                updateStatus({ id: toggleUserId, isActive: toggleUserActive })
              }
              disabled={isPending}
            >
              {toggleUserActive ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
