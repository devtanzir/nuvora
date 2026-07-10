'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/dist/client/components/navigation';

interface AnnouncementBarProps {
  messages?: string[];
  intervalMs?: number;
  visible: boolean;
}

const DEFAULT_MESSAGES = [
  'New Summer Collection - Explore Now →',
  'Free Shipping on Orders Over $499',
  'Get 10% Off Your First Order - Use Code HEXA',
];

const AnnouncementBar = ({
  messages = DEFAULT_MESSAGES,
  intervalMs = 5000,
  visible = true,
}: AnnouncementBarProps) => {
  const [index, setIndex] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  const isHome = pathname === '/';

  if (!isHome) return null;

  return (
      <motion.div
      initial={false}
      animate={{ height: visible ? 36 : 0 }}
      transition={{ duration: 0.50, ease: [0.16, 1, 0.3, 1] }}
      className="w-full overflow-hidden bg-background/70 backdrop-blur-md shadow-sm"
      style={{ willChange: 'height' }}
    >
      <div
        className="flex h-9 w-full items-center justify-center px-4 md:h-10 border-b border-border"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="line-clamp-1 max-w-full text-center text-xs font-medium text-secondary-foreground md:text-sm"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AnnouncementBar
