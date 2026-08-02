import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MotionLink = motion(Link);

const FooterLinkItems = ({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) => {
  return (
    <MotionLink
      href={href}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group inline-flex items-center gap-1.5 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <motion.span
        variants={{ rest: { opacity: 1 }, hover: { opacity: 0.7 } }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative pb-0.5 text-primary`}
      >
        {label}
        <motion.span
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent"
          variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-hidden="true"
        />
      </motion.span>
      <motion.span
        variants={{ rest: { opacity: 0, x: 0 }, hover: { opacity: 1, x: 3 } }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <ArrowRight className="h-3 w-3 text-accent" aria-hidden="true" />
      </motion.span>
    </MotionLink>
  );
};

export default FooterLinkItems;
