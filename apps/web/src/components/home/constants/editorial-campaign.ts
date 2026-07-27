export const UNDERLINE_VARIANTS = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1 },
};
export const ARROW_VARIANTS = {
  rest: { x: 0 },
  hover: { x: 4 },
};
export const ARROW_SPRING = { type: 'spring', stiffness: 160, damping: 20, mass: 0.4 } as const;
