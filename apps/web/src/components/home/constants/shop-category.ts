import { TextScale } from "../types/shop-category";

export const DURATION = { slow: 0.45 } as const;
export const STAGGER_DELAY = 0.08;
export const EASE_CLASS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
export const HOVER_SPRING = { type: 'spring', stiffness: 140, damping: 20, mass: 0.5 } as const;
export const PARALLAX_STRENGTH = 18; // px of drift each way while the image travels through the viewport


export const IMAGE_HOVER_VARIANTS = {
  rest: { scale: 1, filter: 'brightness(1)' },
  hover: { scale: 1.03, filter: 'brightness(1.02)' },
};
export const GRADIENT_HOVER_VARIANTS = {
  rest: { opacity: 1 },
  hover: { opacity: 0.9 },
};
export const TITLE_HOVER_VARIANTS = {
  rest: { y: 0 },
  hover: { y: -4 },
};
export const CTA_HOVER_VARIANTS = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};
export const ARROW_HOVER_VARIANTS = {
  rest: { x: 0 },
  hover: { x: 4 },
};

/* ------------------------------------------------------------------ */

export const CURATED_ORDER = [
  'shirts',
  'dresses',
  'tops',
  'accessories',
  'boots',
  'backpacks',
] as const;




export const TEXT_SCALE_STYLES: Record<TextScale, { heading: string; padding: string; label: string }> = {
  feature: {
    heading: 'text-4xl md:text-[2.75rem]',
    padding: 'p-9 md:p-11',
    label: 'text-[11px]',
  },
  wide: {
    heading: 'text-3xl md:text-4xl',
    padding: 'p-8 md:p-10',
    label: 'text-[10.5px]',
  },
  medium: {
    heading: 'text-2xl md:text-3xl',
    padding: 'p-7 md:p-8',
    label: 'text-[10px]',
  },
};
