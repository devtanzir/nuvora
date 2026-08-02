import Link from 'next/link';
import React, { RefObject } from 'react';
import { BOTTOM_LINKS } from './constants/footer-constants';


const FooterBottom = ({ bottomBarRef }: { bottomBarRef: RefObject<HTMLDivElement | null> }) => {
  return (
    <>
      <div ref={bottomBarRef} className="border-t border-muted-foreground/10">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-4 px-6 py-8 text-[13px] text-muted-foreground/40 md:flex-row md:justify-between md:px-10">
          <span>© {new Date().getFullYear()} Nuvora</span>
          <div className="flex items-center gap-7">
            {BOTTOM_LINKS.map((link : { label: string; href: string }) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterBottom;
