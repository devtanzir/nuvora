import { NavItem } from "@/config/nav-config.ts";
import { motion } from "framer-motion";
import { dropdownVariants } from "./constants/variants";
import Link from "next/link";
import Image from "next/image";

const MegaMenu = ({
  item,
}: {
  item: NavItem;
}) => {
  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-full left-1/2 -translate-x-1/4 lg:-translate-x-1/2 mt-2 w-[640px] rounded-xl bg-card border border-border shadow-lg p-4 origin-top"
      style={{ zIndex: 100 }}
    >
      <div className="flex gap-4">
        {/* Left: columns (3/4) */}
        <div className="flex flex-1 gap-6 flex-wrap">
          {item.columns?.map((col) => (
            <div
              key={col.heading}
              className="flex flex-col gap-1 min-w-[110px]"
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {col.heading}
              </span>
              {col.items.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="text-sm text-foreground hover:text-[#B58B45] transition-colors duration-150 py-0.5"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Right: editorial images (1/4) */}
        <div className="flex flex-col gap-3 w-[130px] shrink-0">
          {item.editorialImages?.map((img) => (
            <Link key={img.href} href={img.href} className="group block">
              <div className="overflow-hidden rounded-lg aspect-[3/4] bg-muted">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={300}
                  height={700}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-[11px] font-medium text-foreground mt-1.5 group-hover:text-[#B58B45] transition-colors">
                {img.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MegaMenu;
