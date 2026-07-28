export const IMAGE_HOVER_VARIANTS = {
  rest: { scale: 1, filter: 'brightness(1) contrast(1)' },
  hover: { scale: 1.025, filter: 'brightness(1.02) contrast(1.02)' },
};
export const UNDERLINE_VARIANTS = { rest: { scaleX: 0 }, hover: { scaleX: 1 } };
export const ARROW_VARIANTS = { rest: { x: 0 }, hover: { x: 4 } };
export const HOVER_SPRING = { type: 'spring', stiffness: 150, damping: 22, mass: 0.4 } as const;


export const HEADER_OFFSET = 'var(--header-height, 1.5rem)';

export const SCROLL_PACING = 1.15;

export const NEIGHBOR_SCALE = 0.95;
export const NEIGHBOR_OPACITY = 0.55;
export const NEIGHBOR_SATURATION = 0.9;
export const NEIGHBOR_IMAGE_BLUR_PX = 1.5;

export const IMAGE_PARALLAX_PX = 20;
export const IMAGE_ZOOM_REST = 1.03;
export const TEXT_RISE_PX = 12;


export const TEXT_REVEAL_STARTS = [0, 0.22, 0.42, 0.6];
export const CLOSING_REVEAL_STARTS = [0];
