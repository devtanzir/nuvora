import { useEffect, useRef } from "react";
import { DURATION, STAGGER_DELAY } from "../constants/shop-category";
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';



gsap.registerPlugin(ScrollTrigger);


const useScrollReveal = <T extends HTMLElement>(delayIndex: number) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.set(ref.current, { autoAlpha: 0, y: 16 });
      gsap.to(ref.current, {
        autoAlpha: 1,
        y: 0,
        duration: DURATION.slow,
        delay: delayIndex * STAGGER_DELAY,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [delayIndex]);

  return ref;
}

export default useScrollReveal;
