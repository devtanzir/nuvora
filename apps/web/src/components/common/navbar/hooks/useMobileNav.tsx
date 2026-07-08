import { useWishlist } from '@/hooks/use-wishlist';
import { useCartStore } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { usePathname } from 'next/navigation';
import React from 'react';
import { NavItem } from '../interface/mobile-navitem';
import { ROUTES } from '@/constants/routes';
import { Heart, Home, Search, ShoppingBag, User } from 'lucide-react';

const useMobileNav = () => {
    const pathname = usePathname();
  const { itemCount } = useCartStore();
    const { data } = useWishlist();
    const count = data?.meta.total ?? 0;
  const {openSearch} = useUIStore()

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: ROUTES.HOME,
      Icon: Home,
      matchPaths: ['/'],
    },
    {
      label: 'Search',
      href: '#',
      Icon: Search,
      onClick: openSearch,
    },
    {
      label: 'Wishlist',
      href: ROUTES.WISHLIST,
      Icon: Heart,
      count: count,
    },
    {
      label: 'Cart',
      href: ROUTES.CART,
      Icon: ShoppingBag,
      count: itemCount,
    },
    {
      label: 'Account',
      href: ROUTES.PROFILE,
      Icon: User,
    },
  ];

  const isActive = (item: NavItem): boolean => {
    if (item.href === '#') return false;
    if (item.href === ROUTES.HOME || item.href === '/') {
      return pathname === '/' || pathname === ROUTES.HOME;
    }
    return pathname.startsWith(item.href);
  };

  return {
    navItems,
    isActive,
  }
};

export default useMobileNav;
