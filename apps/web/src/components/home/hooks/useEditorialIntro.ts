import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useEditorialIntro = () => {
  const introRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const elements = [
      eyebrowRef.current,
      headingRef.current,
      paragraphRef.current,
      ctaRef.current,
    ].filter(Boolean) as HTMLElement[];

    if (reduceMotion || !introRef.current || elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(elements, { opacity: 0, y: 18 });

      ScrollTrigger.create({
        trigger: introRef.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.12,
          });
        },
      });
    }, introRef);

    return () => ctx.revert();
  }, []);

  return {
    introRef,
    eyebrowRef,
    headingRef,
    paragraphRef,
    ctaRef
  };
};

export default useEditorialIntro;
