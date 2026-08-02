import { type Variants } from 'framer-motion';

export const UNDERLINE_VARIANTS = { rest: { scaleX: 0 }, hover: { scaleX: 1 } };
export const ARROW_VARIANTS = { rest: { x: 0 }, hover: { x: 4 } };
export const HOVER_SPRING = {
  type: 'spring',
  stiffness: 150,
  damping: 22,
  mass: 0.4,
} as const;


export const cardContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
