"use client";

import { NavItem } from "@/config/nav-config.ts";
import { motion } from "framer-motion";
import Link from "next/link";
import { dropdownVariants } from "./constants/variants";

const SmallDropdown = ({ item }: { item: NavItem }) => {
  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[200px] rounded-xl bg-card border border-border shadow-lg p-2 origin-top"
      style={{ zIndex: 100 }}
    >
      {item.dropdownItems?.map((sub) => (
        <Link
          key={sub.href}
          href={sub.href}
          className="block text-sm text-foreground hover:text-accent hover:bg-accent/30 transition-colors duration-150 rounded-lg px-3 py-2"
        >
          {sub.label}
        </Link>
      ))}
    </motion.div>
  );
}

export default SmallDropdown;
