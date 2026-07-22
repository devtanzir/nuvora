import { Leaf, Scissors, ShieldCheck, Truck } from "lucide-react";
import { BrandValue } from "../interface/brand-value";

export const DEFAULT_VALUES: BrandValue[] = [
  {
    title: 'Premium Fabrics',
    description: 'Natural fibers selected for timeless quality.',
    icon: Scissors,
  },
  {
    title: 'Ethically Made',
    description: 'Designed in small, thoughtful batches.',
    icon: Leaf,
  },
  {
    title: 'Free Shipping',
    description: 'Complimentary delivery on orders over ৳3000.',
    icon: Truck,
  },
  {
    title: '30-Day Returns',
    description: 'Simple, no-questions-asked returns.',
    icon: ShieldCheck,
  },
];

export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const DURATION = { fast: 0.15, medium: 0.25, slow: 0.45, theme: 0.3 } as const;
export const EASE_CLASS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
