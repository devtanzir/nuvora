import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { mobileSheetVariants } from './constants/variants';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/config/nav-config.ts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LogoComponent from './logo-component';

const MobileSheetContent = ({
  isAuthenticated,
  onClose,
  scrolled,
  isTransparent,
  isDarkMode,
}: {
  isAuthenticated: boolean;
  onClose: () => void;
  scrolled: boolean;
  isTransparent: boolean;
  isDarkMode: boolean;
}) => {
  return (
    <motion.div
      variants={mobileSheetVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full"
    >
      {/* Logo */}
      <div className="mb-6">
        <LogoComponent
          scrolled={scrolled}
          isTransparent={isTransparent}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Nav accordion */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full">
          {NAV_ITEMS.map((item) => {
            if (item.type === 'link') {
              return (
                <div key={item.label} className="border-b border-border">
                  <Link
                    href={item.href ?? '#'}
                    onClick={onClose}
                    className="flex items-center py-4 text-base font-medium text-foreground hover:text-[#B58B45] transition-colors"
                  >
                    {item.label}
                  </Link>
                </div>
              );
            }

            const subItems =
              item.type === 'mega'
                ? (item.columns?.flatMap((col) => col.items) ?? [])
                : (item.dropdownItems ?? []);

            return (
              <AccordionItem
                key={item.label}
                value={item.label}
                className="border-b border-border"
              >
                <AccordionTrigger className="py-4 text-base font-medium text-foreground hover:text-[#B58B45] hover:no-underline [&>svg]:text-[#B58B45]">
                  {item.label}
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-0">
                  <div className="flex flex-col gap-0.5 pl-1">
                    {subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onClose}
                        className="py-2 text-sm text-muted-foreground hover:text-[#B58B45] transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Auth buttons at bottom */}
      {!isAuthenticated && (
        <div className="pt-6 flex flex-col gap-3 border-t border-border mt-4">
          <Button
            asChild
            variant="outline"
            className="w-full border-[#B58B45] text-[#B58B45] hover:bg-[#B58B45]/10"
          >
            <Link href="/auth/login" onClick={onClose}>
              Sign In
            </Link>
          </Button>
          <Button
            asChild
            className="w-full bg-[#3A322B] text-white hover:bg-[#3A322B]/90"
          >
            <Link href="/auth/register" onClick={onClose}>
              Create Account
            </Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MobileSheetContent;
