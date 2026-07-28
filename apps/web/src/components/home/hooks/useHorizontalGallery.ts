import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CardMetrics, CardSetters } from '../interface/horizontal-gallery';
import { Product } from '@/types/product.types';
import {
  CLOSING_REVEAL_STARTS,
  IMAGE_PARALLAX_PX,
  IMAGE_ZOOM_REST,
  NEIGHBOR_IMAGE_BLUR_PX,
  NEIGHBOR_OPACITY,
  NEIGHBOR_SATURATION,
  NEIGHBOR_SCALE,
  SCROLL_PACING,
  TEXT_REVEAL_STARTS,
  TEXT_RISE_PX,
} from '../constants/new-arrivals';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useHorizontalGallery = (products: Product[]) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textGroupRefs = useRef<(HTMLElement | null)[][]>([]);

  const metricsRef = useRef<CardMetrics[]>([]);
  const trackWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const maxTranslateRef = useRef(0);
  const activeIndexRef = useRef(0);

  const cardSettersRef = useRef<(CardSetters | null)[]>([]);
  const trackXSetterRef = useRef<((v: number) => void) | null>(null);
  const backgroundXSetterRef = useRef<((v: number) => void) | null>(null);

  const panelCount = products.length + 1;

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const measure = () => {
      if (!trackRef.current) return;
      const cards = Array.from(trackRef.current.children) as HTMLElement[];
      metricsRef.current = cards.map((el) => ({
        left: el.offsetLeft,
        width: el.offsetWidth,
      }));
      trackWidthRef.current = trackRef.current.scrollWidth;
      viewportWidthRef.current = window.innerWidth;

      const last = metricsRef.current[metricsRef.current.length - 1];
      maxTranslateRef.current = last
        ? Math.max(0, last.left + last.width / 2 - viewportWidthRef.current / 2)
        : 0;
    };

    measure();

    cardSettersRef.current = cardRefs.current.map((cardEl, i) => {
      const imageWrapEl = imageWrapRefs.current[i];
      const textEls = (textGroupRefs.current[i] ?? []).filter(
        Boolean,
      ) as HTMLElement[];
      if (!cardEl || !imageWrapEl || textEls.length === 0) return null;

      const starts =
        textEls.length > 1 ? TEXT_REVEAL_STARTS : CLOSING_REVEAL_STARTS;

      return {
        scale: gsap.quickSetter(cardEl, 'scale') as (v: number) => void,
        opacity: gsap.quickSetter(cardEl, 'opacity') as (v: number) => void,
        imgX: gsap.quickSetter(imageWrapEl, 'x', 'px') as (v: number) => void,
        imgScale: gsap.quickSetter(imageWrapEl, 'scale') as (v: number) => void,
        texts: textEls.map((el, j) => ({
          opacity: gsap.quickSetter(el, 'opacity') as (v: number) => void,
          y: gsap.quickSetter(el, 'y', 'px') as (v: number) => void,
          start: starts[j] ?? starts[starts.length - 1] ?? 0,
        })),
      };
    });

    trackXSetterRef.current = trackRef.current
      ? (gsap.quickSetter(trackRef.current, 'x', 'px') as (v: number) => void)
      : null;
    backgroundXSetterRef.current = backgroundRef.current
      ? (gsap.quickSetter(backgroundRef.current, 'x', 'px') as (
          v: number,
        ) => void)
      : null;

    const handleUpdate = (self: ScrollTrigger) => {
      const progress = self.progress;
      const trackX = -progress * maxTranslateRef.current;
      trackXSetterRef.current?.(trackX);

      const viewportCenter = viewportWidthRef.current / 2;
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      metricsRef.current.forEach((metrics, i) => {
        const cardCenter = trackX + metrics.left + metrics.width / 2;
        const distance = cardCenter - viewportCenter;
        const absDistance = Math.abs(distance);

        if (absDistance < nearestDistance) {
          nearestDistance = absDistance;
          nearestIndex = i;
        }

        const falloff = metrics.width * 0.85;
        const proximity = gsap.utils.clamp(0, 1, 1 - absDistance / falloff);

        const setters = cardSettersRef.current[i];
        if (setters) {
          setters.scale(
            gsap.utils.mapRange(0, 1, NEIGHBOR_SCALE, 1, proximity),
          );
          setters.opacity(
            gsap.utils.mapRange(0, 1, NEIGHBOR_OPACITY, 1, proximity),
          );
          setters.imgX(
            gsap.utils.clamp(
              -IMAGE_PARALLAX_PX,
              IMAGE_PARALLAX_PX,
              (-distance / falloff) * IMAGE_PARALLAX_PX,
            ),
          );
          setters.imgScale(
            gsap.utils.mapRange(0, 1, IMAGE_ZOOM_REST, 1, proximity),
          );

          // Category → title → price → CTA, staggered by proximity, never together.
          setters.texts.forEach((text) => {
            const local = gsap.utils.clamp(
              0,
              1,
              (proximity - text.start) / (1 - text.start),
            );
            text.opacity(local);
            text.y(gsap.utils.mapRange(0, 1, TEXT_RISE_PX, 0, local));
          });
        }

        const imageWrapEl = imageWrapRefs.current[i];
        if (imageWrapEl) {
          const saturation = gsap.utils.mapRange(
            0,
            1,
            NEIGHBOR_SATURATION,
            1,
            proximity,
          );
          const blur = gsap.utils.mapRange(
            0,
            1,
            NEIGHBOR_IMAGE_BLUR_PX,
            0,
            proximity,
          );
          gsap.set(imageWrapEl, {
            filter: `saturate(${saturation}) blur(${blur}px)`,
          });
        }
      });

      backgroundXSetterRef.current?.(
        gsap.utils.mapRange(0, 1, -5, 5, progress),
      );

      if (nearestIndex !== activeIndexRef.current) {
        activeIndexRef.current = nearestIndex;
        if (progressRef.current) {
          progressRef.current.textContent = String(nearestIndex + 1).padStart(
            2,
            '0',
          );
        }
      }
    };

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${maxTranslateRef.current * SCROLL_PACING}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: handleUpdate,
      });

      return () => trigger.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, [products.length]);

  return {
    sectionRef,
    backgroundRef,
    progressRef,
    panelCount,
    trackRef,
    cardRefs,
    imageWrapRefs,
    textGroupRefs,
  };
};

export default useHorizontalGallery;
