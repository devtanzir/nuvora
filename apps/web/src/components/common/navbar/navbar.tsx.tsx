'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/config/nav-config.ts';
import DesktopNavItem from './desktop-navitem';
import { NotificationDropdown } from './notification-dropdown';
import { WishlistIcon } from './wishlist-icon';
import { CartIcon } from './cart-icon';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { MobileBottomNav } from './mobile-bottom-nav';
import MobileSheetContent from './mobile-sheet-content';
import useNavbar from './hooks/useNavbar';
import LogoComponent from './logo-component';
import AnnouncementBar from '../announcement-bar';

export function Navbar() {
  const {
    scrolled,
    isTransparent,
    iconColor,
    openSearch,
    toggleTheme,
    isDarkMode,
    isAuthenticated,
    setMobileOpen,
    mobileOpen,
  } = useNavbar();

  return (
    <>
    <div className="sticky top-0 left-0 right-0 z-50 flex flex-col">
        <AnnouncementBar visible={scrolled} />
      <motion.header
        animate={{
          height: scrolled ? 64 : 80,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center
    ${scrolled ? 'bg-background/70 backdrop-blur-md shadow-sm w-full' : 'fixed top-0 left-0 right-0 z-50 bg-transparent'}
  `}
        style={{ willChange: 'height' }}
      >
        <div className="max-w-screen-xl mx-auto w-full px-6 flex items-center justify-between gap-8">
          {/* Logo */}
          <LogoComponent
            scrolled={scrolled}
            isTransparent={isTransparent}
            isDarkMode={isDarkMode}
          />

          {/* Center nav - hidden on mobile */}
          <nav
            className="hidden md:flex items-center lg:gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                isTransparent={isTransparent}
              />
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className={`hidden md:inline-flex transition-colors cursor-pointer ${iconColor}`}
              onClick={openSearch}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <NotificationDropdown iconColor={iconColor} />

            {/* Wishlist */}
            <WishlistIcon iconColor={iconColor} />

            {/* Cart */}
            <CartIcon iconColor={iconColor} />

            {/* Theme toggle */}
            <ThemeToggle
              iconColor={iconColor}
              onThemeToggle={toggleTheme!}
              isDarkMode={isDarkMode}
            />

            {/* User menu */}
            <div className="hidden md:block">
              <UserMenu iconColor={iconColor} />
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden transition-colors ${iconColor}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>
</div>
      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-80 p-6 bg-background border-r border-border flex flex-col"
        >
          <SheetHeader className="mb-0 pb-0 text-left">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <AnimatePresence>
            {mobileOpen && (
              <MobileSheetContent
                isAuthenticated={isAuthenticated}
                scrolled={scrolled}
                isTransparent={isTransparent}
                isDarkMode={isDarkMode}
                onClose={() => setMobileOpen(false)}
              />
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </>
  );
}

export default Navbar;
