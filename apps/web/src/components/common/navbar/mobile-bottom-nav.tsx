'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import useMobileNav from './hooks/useMobileNav';


export const MobileBottomNav = () => {
const {navItems, isActive} = useMobileNav();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 dark:bg-background/90 backdrop-blur-md border-t border-border flex items-center"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex w-full px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const { label, href, Icon, count, onClick } = item;

          return (
            <Link
              key={label}
              href={href}
              onClick={
                onClick
                  ? (e) => {
                      e.preventDefault();
                      onClick();
                    }
                  : undefined
              }
              aria-label={`${label}${count ? ` (${count})` : ''}`}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative"
            >
              {/* Icon container with animated background */}
              <span className="relative flex items-center justify-center">
                {/* Active pill background */}
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 -m-2 rounded-full bg-accent/15 dark:bg-accent/20"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={{
                    scale: active ? 1.1 : 1,
                    color: active ? 'var(--accent)' : "var(--muted-foreground)",
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={
                    active
                      ? 'text-accent relative z-10'
                      : 'text-muted-foreground relative z-10'
                  }
                >
                  <Icon className="h-5 w-5" />
                </motion.span>

                {/* Badge */}
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full bg-accent text-[10px] font-semibold text-white flex items-center justify-center px-[3px] leading-none z-20">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </span>

              {/* Label */}
              <motion.span
                animate={{
                  color: active ? 'var(--accent)' : "var(--muted-foreground)",
                  fontWeight: active ? 600 : 400,
                }}
                transition={{ duration: 0.15 }}
                className={`text-[10px] leading-none ${
                  active ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                {label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
