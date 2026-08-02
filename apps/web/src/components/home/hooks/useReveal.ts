import { useReducedMotion } from 'framer-motion';

const useReveal = () => {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: {
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1] as const,
            delay,
          },
        };

  return {
    reveal,
  };
};

export default useReveal;
