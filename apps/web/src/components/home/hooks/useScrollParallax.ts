import { useEffect, useRef } from "react";
import { PARALLAX_STRENGTH } from "../constants/shop-category";
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);


const useScrollParallax = <T extends HTMLElement>(strength: number = PARALLAX_STRENGTH) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: -strength },
        {
          y: strength,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [strength]);

  return ref;
}

export default useScrollParallax;
