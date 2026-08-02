import { NavColumnData } from "../interface";

export const NAV_COLUMNS: NavColumnData[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Collections', href: '/collections' },
      { label: 'New Arrivals', href: '/products?sort=newest' },
      { label: 'Featured Pieces', href: '/products?featured=true' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Journal', href: '/journal' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { label: 'Instagram', href: 'https://instagram.com', external: true },
      { label: 'Pinterest', href: 'https://pinterest.com', external: true },
      { label: 'Facebook', href: 'https://facebook.com', external: true },
      { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
    ],
  },
];

export const BOTTOM_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Accessibility', href: '/accessibility' },
];
