'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NavLinks } from './nav-links';
import { CartIcon } from './cart-icon';
import { WishlistIcon } from './wishlist-icon';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { NuvoraLogo } from '../icons/nuvora-logo';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-background',
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href={ROUTES.HOME}
              className="text-xl"
            >
              <NuvoraLogo className="h-auto w-32" />
            </Link>

            {/* Desktop Nav Links */}
            <NavLinks />

            {/* Desktop Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {isAuthenticated && <WishlistIcon />}
              {isAuthenticated && <CartIcon />}

              <ThemeToggle />
              <UserMenu />

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-lg md:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {[
                { label: 'Home', href: ROUTES.HOME },
                { label: 'Products', href: ROUTES.PRODUCTS },
                { label: 'Categories', href: ROUTES.CATEGORIES },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium hover:text-gold transition-colors"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={ROUTES.LOGIN} onClick={closeMobileMenu}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-navy text-white"
                    asChild
                  >
                    <Link href={ROUTES.REGISTER} onClick={closeMobileMenu}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
