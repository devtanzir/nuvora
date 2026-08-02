'use client';

import FooterTop from './footer-top';
import FooterLinks from './footer-links';
import FooterBranding from './footer-branding';
import FooterBottom from './footer-bottom';
import useFooter from './hooks/useFooter';

const SiteFooter = () => {
  const {
    footerRef,
    dividerRef,
    headlineRef,
    paragraphRef,
    ctaRef,
    navRef,
    signatureRef,
    bottomBarRef,
  } = useFooter();

  return (
    <footer
      ref={footerRef}
      className={`relative w-full overflow-hidden bg-background`}
    >
      <div
        ref={dividerRef}
        className="h-px w-full bg-accent"
        aria-hidden="true"
      />

      <FooterTop
        headlineRef={headlineRef}
        paragraphRef={paragraphRef}
        ctaRef={ctaRef}
      />

      <FooterLinks navRef={navRef} />

      <FooterBranding signatureRef={signatureRef} />

      <FooterBottom bottomBarRef={bottomBarRef} />
    </footer>
  );
};

export default SiteFooter;
