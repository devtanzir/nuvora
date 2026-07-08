import { type Variants } from "framer-motion";

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

export const mobileSheetVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, x: -24, transition: { duration: 0.16, ease: 'easeIn' } },
};
