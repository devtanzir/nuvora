export interface NavSubItem {
  label: string;
  href: string;
}

export interface NavColumn {
  heading: string;
  items: NavSubItem[];
}

export interface NavEditorialImage {
  src: string;
  alt: string;
  title: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  type: 'link' | 'mega' | 'dropdown';
  columns?: NavColumn[];
  editorialImages?: NavEditorialImage[];
  dropdownItems?: NavSubItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Shop',
    type: 'mega',
    columns: [
      {
        heading: 'New Arrivals',
        items: [
          { label: 'New Arrivals', href: '/products?sortBy=newest' },
          { label: 'Best Sellers', href: '/products?sortBy=most_reviewed' },
          { label: 'Sale', href: '/products?sortBy=price_asc&page=1' },
        ],
      },
      {
        heading: 'Men',
        items: [
          { label: 'Shirts', href: '/products?category=shirts' },
          { label: 'T-Shirts', href: '/products?category=t-shirts' },
          { label: 'Pants', href: '/products?category=pants' },
          { label: 'Outerwear', href: '/products?category=outerwear' },
          { label: 'Accessories', href: '/products?category=accessories' },
        ],
      },
      {
        heading: 'Women',
        items: [
          { label: 'Dresses', href: '/products?category=dresses' },
          { label: 'Tops', href: '/products?category=tops' },
          { label: 'Trousers', href: '/products?category=trousers' },
          { label: 'Outerwear', href: '/products?category=outerwear' },
          { label: 'Accessories', href: '/products?category=accessories' },
        ],
      },
      {
        heading: 'Kids',
        items: [
          { label: 'T‑Shirts', href: '/products?category=kids-tshirts' },
          { label: 'Pants', href: '/products?category=kids-pants' },
          { label: 'Dresses', href: '/products?category=kids-dresses' },
          { label: 'Outerwear', href: '/products?category=kids-outerwear' },
          { label: 'Accessories', href: '/products?category=kids-accessories' },
        ],
      },
      {
        heading: 'Shoes',
        items: [
          { label: 'Sneakers', href: '/products?category=sneakers' },
          { label: 'Boots', href: '/products?category=boots' },
          { label: 'Sandals', href: '/products?category=sandals' },
          { label: 'Formal', href: '/products?category=formal-shoes' },
          { label: 'Loafers', href: '/products?category=loafers' },
        ],
      },
      {
        heading: 'Bags',
        items: [
          { label: 'Backpacks', href: '/products?category=backpacks' },
          { label: 'Totes', href: '/products?category=totes' },
          { label: 'Crossbody', href: '/products?category=crossbody' },
          { label: 'Clutches', href: '/products?category=clutches' },
          { label: 'Wallets', href: '/products?category=wallets' },
        ],
      },
    ],
    editorialImages: [
      {
        src: '/images/new-season-editorial.jpg',
        alt: 'New Season Editorial',
        title: 'New Season',
        href: '/shop/new-arrivals',
      },
      {
        src: '/images/summer-essentials-editorial.jpg',
        alt: 'Summer Essentials Editorial',
        title: 'Summer Edit',
        href: '/shop/summer',
      },
    ],
  },
  {
    label: 'Collections',
    type: 'dropdown',
    dropdownItems: [
      { label: 'Spring 2026', href: '/products?category=spring-2026' },
      {
        label: 'Summer Essentials',
        href: '/products?category=summer-essentials',
      },
      { label: 'Limited Edition', href: '/products?category=limited-edition' },
      { label: 'Archive', href: '/products?category=archive' },
    ],
  },
  {
    label: 'Journal',
    href: '/journal',
    type: 'link',
  },
  {
    label: 'About',
    type: 'dropdown',
    dropdownItems: [
      { label: 'Our Story', href: '/our-story' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Craftsmanship', href: '/craftsmanship' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export const MOBILE_BOTTOM_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search', isSearch: true },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Cart', href: '/cart' },
  { label: 'Account', href: '/profile' },
];
