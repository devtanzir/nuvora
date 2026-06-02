import Link from 'next/link';
import { NuvoraLogo } from '@/components/common/icons/nuvora-logo';
import { ROUTES } from '@/constants/routes';
import { Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <NuvoraLogo className="h-auto w-28" fillColor="#EEEADD" />
            <p className="text-white/60 text-sm leading-relaxed">
              Discover premium fashion curated for the modern individual.
              Where luxury meets everyday elegance.
            </p>
            <div className="flex gap-3">
              {[Clock, Clock, Clock].map((Icon, i) => (
                  <a
                  key={ i}
                  href="#"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-gold/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4 text-white/70 hover:text-gold" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <p className="font-medium text-gold tracking-widest uppercase text-xs">
              Shop
            </p>
            <ul className="space-y-2">
              {[
                { label: 'All Products', href: ROUTES.PRODUCTS },
                { label: 'Categories', href: ROUTES.CATEGORIES },
                { label: 'New Arrivals', href: `${ROUTES.PRODUCTS}?sortBy=newest` },
                { label: 'Best Sellers', href: `${ROUTES.PRODUCTS}?sortBy=most_reviewed` },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <p className="font-medium text-gold tracking-widest uppercase text-xs">
              Account
            </p>
            <ul className="space-y-2">
              {[
                { label: 'My Profile', href: ROUTES.PROFILE },
                { label: 'My Orders', href: ROUTES.ORDERS },
                { label: 'Wishlist', href: ROUTES.WISHLIST },
                { label: 'Notifications', href: ROUTES.NOTIFICATIONS },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <p className="font-medium text-gold tracking-widest uppercase text-xs">
              Support
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', href: '#' },
                { label: 'FAQs', href: '#' },
                { label: 'Shipping Policy', href: '#' },
                { label: 'Return Policy', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Nuvora. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Built by Tanzir Ibne Ali
          </p>
        </div>
      </div>
    </footer>
  );
}
