import { RefObject } from "react";

const FooterBranding = ({ signatureRef }: { signatureRef: RefObject<HTMLDivElement | null> }) => {
  return (
    <>
      <div className="border-t border-border/10">
        <div
          ref={signatureRef}
          className="mx-auto max-w-[90rem] px-6 py-14 lg:py-16 text-center md:px-10"
        >
          <p
            className={`font-heading text-[clamp(3.75rem,6vw,4.5rem)] font-light leading-none tracking-[0.12em] text-primary`}
          >
            NUVORA
          </p>
          <p className="mt-6 text-sm text-muted-foreground/50">Designed in Bangladesh. Crafted for Everywhere.</p>
        </div>
      </div>
    </>
  );
};

export default FooterBranding;
