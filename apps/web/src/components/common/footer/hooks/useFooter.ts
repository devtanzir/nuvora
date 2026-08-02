import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
const useFooter = () => {
  const reduceMotion = useReducedMotion();

  const footerRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const navColumns = navRef.current
        ? Array.from(navRef.current.children)
        : [];

      gsap.set(dividerRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
      });
      gsap.set(headlineRef.current, { opacity: 0, y: 20 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 12 });
      gsap.set(ctaRef.current, { opacity: 0, y: 8 });
      gsap.set(navColumns, { opacity: 0, y: 14 });
      gsap.set(signatureRef.current, { opacity: 0, y: 10 });
      gsap.set(bottomBarRef.current, { opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });

      tl.to(dividerRef.current, {
        scaleX: 1,
        duration: 1,
        ease: 'power1.inOut',
      })
        .to(headlineRef.current, { opacity: 1, y: 0, duration: 1 }, '-=0.3')
        .to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .to(
          navColumns,
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          '+=0.1',
        )
        .to(signatureRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.2')
        .to(bottomBarRef.current, { opacity: 1, duration: 0.6 }, '-=0.2');

      ScrollTrigger.create({
        trigger: footerRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => tl.play(),
      });
    }, footerRef);

    return () => ctx.revert();
  }, [reduceMotion]);
  return {
    footerRef,
    dividerRef,
    headlineRef,
    paragraphRef,
    ctaRef,
    navRef,
    signatureRef,
    bottomBarRef,
  };
};

export default useFooter;
