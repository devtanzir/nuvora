import { MotionValue } from "framer-motion";
import { RefObject } from "react";

export interface HeroSectionProps {
  onIntroReveal?: () => void;
}

export interface LogoIntroProps {
  logoVisible: boolean;
  isDarkMode: boolean;
}

export interface HeroImageProps {
  imageWrapRef: React.RefObject<HTMLDivElement | null>;
  handleMouseMove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleMouseLeave: () => void;
  rotateX: MotionValue<string>;
  rotateY: MotionValue<string>;
  imageX: MotionValue<number>;
  imageY: MotionValue<number>;
  isDark: boolean;
  hotspotX: MotionValue<number>;
  hotspotY: MotionValue<number>;
  reducedMotion: boolean;
}

export interface HeroContentProps {
  textColRef: RefObject<HTMLDivElement | null>;
}
