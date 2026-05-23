'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Image,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { NuvoraLogo } from '@/components/common/icons/nuvora-logo';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.ADMIN, icon: LayoutDashboard, exact: true },
  { label: 'Products', href: ROUTES.ADMIN_PRODUCTS, icon: Package },
  { label: 'Orders', href: ROUTES.ADMIN_ORDERS, icon: ShoppingCart },
  { label: 'Users', href: ROUTES.ADMIN_USERS, icon: Users },
  { label: 'Categories', href: ROUTES.ADMIN_CATEGORIES, icon: FolderOpen },
  { label: 'Promo Codes', href: ROUTES.ADMIN_PROMO_CODES, icon: Tag },
  { label: 'Banners', href: ROUTES.ADMIN_BANNERS, icon: Image },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col bg-sidebar border-r border-sidebar-border min-h-screen shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <NuvoraLogo className="h-auto w-24" fillColor="#EEEADD" />
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.avatar ?? ''} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                Admin
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className="w-full text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
