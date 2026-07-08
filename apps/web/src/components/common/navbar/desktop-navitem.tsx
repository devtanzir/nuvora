"use client";

import { NavItem } from "@/config/nav-config.ts";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import MegaMenu from "./mega-menu";
import SmallDropdown from "./small-dropdown";
import useDesktopNavItem from "./hooks/useDesktopNavItem";

function DesktopNavItem({
  item,
  isTransparent,
}: {
  item: NavItem;
  isTransparent: boolean;
}) {
  const { open, ref, handleMouseEnter, handleMouseLeave, linkColor } = useDesktopNavItem(isTransparent);
  if (item.type === 'link') {
    return (
      <Link
        href={item.href ?? '#'}
        className={`relative text-sm font-medium transition-colors duration-200 ${linkColor} ${open ? 'text-[#B58B45]' : ''} px-1 py-1`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 px-1 py-1 cursor-pointer
          ${isTransparent ? 'text-white/90 hover:text-white' : 'text-foreground hover:text-[#B58B45]'} ${linkColor}
          ${open ? (isTransparent ? 'text-white' : 'text-[#B58B45]') : ''}
        `}
        aria-expanded={open}
        aria-haspopup="true"
        tabIndex={0}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {item.label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {item.type === 'mega' && (
              <MegaMenu item={item} />
            )}
            {item.type === 'dropdown' && <SmallDropdown item={item} />}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DesktopNavItem;
