'use client';

import { motion, AnimatePresence } from 'framer-motion';


import {
  DURATION,
  EASE_PREMIUM,
  introContainer,
  NOISE_BG,
} from '../constants/hero-constants';
import LogoIntro from './logo-intro';
import HeroContent from './hero-content';
import HeroImage from './hero-image';
import { HeroSectionProps } from '../interface/hero';
import useHero from '../hooks/useHero';



export default function HeroSection({ onIntroReveal }: HeroSectionProps) {
  const {
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
  } = useHero(onIntroReveal);

  return (
    <section
      ref={heroRef}
      className={`${!logoVisible && 'pt-8'} hero-section relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-background transition-colors duration-300"`}
    >
      {/* Ambient background noise */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
        style={{ backgroundImage: NOISE_BG }}
        aria-hidden="true"
      />

      {/* Radial ambient glow behind the image column */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 opacity-70 transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 65% 45%, rgba(58,50,43,0.55), transparent 60%)'
            : 'radial-gradient(circle at 65% 45%, rgba(255,252,248,0.8), transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Cinematic logo intro */}
      <LogoIntro logoVisible={logoVisible} isDarkMode={isDarkMode} />

      <motion.div
        variants={introContainer}
        initial="hidden"
        animate={contentVisible ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-16 px-6 py-16 md:px-10 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 xl:px-16 2xl:px-24"
      >
        {/* ---------------- Left column: text ---------------- */}
        <HeroContent textColRef={textColRef} />

        {/* ---------------- Right column: image ---------------- */}
        <HeroImage
          imageWrapRef={imageWrapRef}
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
          rotateX={rotateX}
          rotateY={rotateY}
          imageX={imageX}
          imageY={imageY}
          isDark={isDark}
          hotspotX={hotspotX}
          hotspotY={hotspotY}
          reducedMotion={reducedMotion}
        />
      </motion.div>

      {/* ---------------- Scroll indicator ---------------- */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            key="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.medium, ease: EASE_PREMIUM }}
            className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 md:bottom-28"
          >
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                Scroll
              </span>
              <div
                className="relative h-8 w-px overflow-hidden bg-border"
                aria-hidden="true"
              >
                <motion.span
                  className="absolute inset-x-0 top-0 h-2 bg-accent"
                  animate={
                    reducedMotion ? undefined : { y: [0, 22], opacity: [1, 0] }
                  }
                  transition={{
                    duration: 1.8,
                    ease: EASE_PREMIUM,
                    repeat: Infinity,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
