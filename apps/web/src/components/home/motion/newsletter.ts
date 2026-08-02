import { type Variants } from 'framer-motion';

export const ARROW_VARIANTS: Variants = { rest: { x: 0 }, hover: { x: 4 } };
export const HOVER_SPRING = { type: 'spring', stiffness: 150, damping: 22, mass: 0.4 } as const;
