import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HeroSectionProps } from '../interface/hero';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useHero = (onIntroReveal: HeroSectionProps['onIntroReveal']) => {
  const [logoVisible, setLogoVisible] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  /* ---------- Cinematic intro sequence ---------- */
  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setLogoVisible(false);
      onIntroReveal?.();
      setContentVisible(true);
    }, 700);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      setReducedMotion(reduced.matches);
      setTiltEnabled(fine.matches && !reduced.matches);
    };
    update();

    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!heroRef.current || !imageWrapRef.current || !textColRef.current)
      return;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageWrapRef.current,
        { scale: 1.08 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        textColRef.current,
        { opacity: 1 },
        {
          opacity: 0.75,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, heroRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  /* ---------- Mouse tilt + hotspot parallax (shared source, kept to ≤1.5deg) ---------- */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springPx = useSpring(px, { stiffness: 150, damping: 20 });
  const springPy = useSpring(py, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(springPy, (v) => `${v * -1.5}deg`);
  const rotateY = useTransform(springPx, (v) => `${v * 1.5}deg`);
  const imageX = useTransform(springPx, (v) => v * 10); // max ~5px either side
  const imageY = useTransform(springPy, (v) => v * 10); // max ~5px either side
  const hotspotX = useTransform(springPx, (v) => v * 8);
  const hotspotY = useTransform(springPy, (v) => v * 8);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltEnabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [tiltEnabled, px, py],
  );

  const handleMouseLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return {
    logoVisible,
    contentVisible,
    isDark,
    reducedMotion,
    scrolled,
    heroRef,
    textColRef,
    imageWrapRef,
    rotateX,
    rotateY,
    imageX,
    imageY,
    hotspotX,
    hotspotY,
    handleMouseMove,
    handleMouseLeave,
    isDarkMode,
  };
};

export default useHero;
