import { CardSize } from "../types/featured-collection";

export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const DURATION = { slow: 0.45 } as const;
export const EASE_CLASS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
export const IMAGE_TRANSITION_CLASS = `duration-[1400ms] ${EASE_CLASS}`;
export const CARD_HOVER_SCALE_CLASS = 'group-hover:scale-[1.025]';



export const SIZE_STYLES: Record<CardSize,{ eyebrow: string; heading: string; padding: string; cta: string }> = {
  large: {
    eyebrow: 'text-xs',
    heading: 'text-3xl md:text-3xl xl:text-[2.75rem]',
    padding: 'p-8 md:p-10',
    cta: 'text-[11px]',
  },
  default: {
    eyebrow: 'text-[11px]',
    heading: 'text-2xl md:text-[1.75rem]',
    padding: 'p-7 md:p-8',
    cta: 'text-[10.5px]',
  },
  compact: {
    eyebrow: 'text-[10px]',
    heading: 'text-xl',
    padding: 'p-6 md:p-7',
    cta: 'text-[10px]',
  },
};
