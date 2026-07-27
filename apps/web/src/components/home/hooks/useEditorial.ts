import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
const useEditorial = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const imageSrc = '/images/editorial-campaign.png';

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          isTablet: '(min-width: 768px) and (max-width: 1023px)',
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, isTablet, reduceMotion } =
            context.conditions as Record<string, boolean>;

          const textTargets = [
            eyebrowRef.current,
            headingRef.current,
            ctaRef.current,
          ];

          if (reduceMotion) {
            gsap.set(textTargets, { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
            gsap.set([driftRef.current, depthRef.current], {
              x: 0,
              y: 0,
              scale: 1,
            });
            return;
          }

          /* ---- Layer 1 + Layer 2 - ambient drift + depth, one shared trigger ---- */
          const driftX = isDesktop ? 10 : isTablet ? 6 : 4;
          const driftY = isDesktop ? 18 : isTablet ? 12 : 8;
          const depthScale = isDesktop ? 1.035 : isTablet ? 1.02 : 1.012;

          const ambientTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.4,
            },
          });

          ambientTimeline
            .fromTo(
              driftRef.current,
              { x: -driftX, y: -driftY },
              { x: driftX, y: driftY, ease: 'none' },
              0,
            )
            .fromTo(
              depthRef.current,
              { scale: 1 },
              { scale: depthScale, ease: 'none' },
              0,
            );

          /* ---- Layer 3 - typography arrival, one timeline, one trigger ---- */
          const riseDistance = isDesktop ? 18 : isTablet ? 14 : 10;
          const useBlur = isDesktop || isTablet; // skip the extra paint cost on mobile only
          const blurFrom = useBlur ? 'blur(6px)' : 'blur(0px)';

          gsap.set(eyebrowRef.current, {
            autoAlpha: 0,
            y: riseDistance,
            filter: blurFrom,
          });
          gsap.set(headingRef.current, {
            autoAlpha: 0,
            y: riseDistance,
            filter: blurFrom,
          });
          gsap.set(ctaRef.current, { autoAlpha: 0, y: riseDistance });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            })
            .to(eyebrowRef.current, {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1.1,
              ease: 'power3.out',
            })
            .to(
              headingRef.current,
              {
                autoAlpha: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 1.35,
                ease: 'power3.out',
              },
              '-=0.85',
            )
            .to(
              ctaRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 1.1,
                ease: 'power3.out',
              },
              '-=0.7',
            );
        },
      );

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return {
    imageSrc,
    sectionRef,
    driftRef,
    depthRef,
    eyebrowRef,
    headingRef,
    ctaRef,
  };
};

export default useEditorial;
