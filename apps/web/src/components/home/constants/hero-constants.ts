export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const DURATION = { fast: 0.15, medium: 0.25, slow: 0.45, theme: 0.3 } as const;

export const EASE_CLASS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

export const introContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0 },
  },
};

export const introItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_PREMIUM },
  },
};

/* ------------------------------------------------------------------ */
/* Editable content                                                    */
/* ------------------------------------------------------------------ */

export const HEADING_LINES = ['Designed for', 'Moments that Matter.'];

export const DESCRIPTION =
  "Made with premium fabrics and thoughtful tailoring, creating pieces you'll wear far beyond the season.";

export const BRAND_VALUES = [
  'PREMIUM FABRICS',
  'ETHICALLY MADE',
  'FREE SHIPPING',
  '30 DAY RETURNS',
];

export const HOTSPOT = {
  eyebrow: 'New Arrival',
  label: 'Linen Overshirt',
  cta: 'View Details',
};

export const IMAGE_LIGHT = '/images/hero-model-light.png';
export const IMAGE_DARK = '/images/hero-model-dark.png';

export const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
