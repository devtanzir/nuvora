'use client';

import Link from 'next/link';
import { User, Package, LogOut, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { useLogout, useMe } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { useMounted } from '@/hooks/use-mounted';

export function UserMenu({ iconColor }: { iconColor?: string }) {
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const { isLoading } = useMe();

  const mounted = useMounted();

  if (!mounted || isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`transition-colors cursor-pointer ${iconColor}`}
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 rounded-xl border border-border bg-card shadow-lg p-1.5"
          >
            <DropdownMenuItem
              asChild
              className="rounded-lg cursor-pointer text-sm"
            >
              <Link href={ROUTES.LOGIN}>Sign In</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="rounded-lg cursor-pointer text-sm"
            >
              <Link href={ROUTES.REGISTER}>Create Account</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full cursor-pointer ${iconColor}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar ?? ''} alt={user?.name} />
            <AvatarFallback className="bg-navy text-white text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user?.role === 'ADMIN' && (
          <>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ADMIN} className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href={ROUTES.PROFILE} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.ORDERS} className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer"
          onClick={() => logout()}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
