import Image from "next/image";
import { DURATION, EASE_PREMIUM, IMAGE_DARK, IMAGE_LIGHT, introItem, NOISE_BG } from "../constants/hero-constants";
import { motion } from "framer-motion";
import HeroHotspot from "./hero-hotspot";
import { HeroImageProps } from "../interface/hero";


const HeroImage = ({
  imageWrapRef,
  handleMouseMove,
  handleMouseLeave,
  rotateX,
  rotateY,
  imageX,
  imageY,
  isDark,
  hotspotX,
  hotspotY,
  reducedMotion,
}: HeroImageProps) => {
  return (
    <>
        <motion.div
          variants={introItem}
          className="relative"
          style={{ perspective: 1600 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >

          <div
            ref={imageWrapRef}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-none bg-primary/5 shadow-[0 24px 50px -20px rgba(0,0,0,.18)]"
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                x: imageX,
                y: imageY,
                transformStyle: 'preserve-3d',
              }}
              whileHover={reducedMotion ? undefined : { scale: 1.01 }}
              transition={{ duration: DURATION.slow, ease: EASE_PREMIUM }}
              className="absolute inset-0"
            >
              {/* Crossfading theme-aware images */}
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: isDark ? 0 : 1 }}
                transition={{ duration: DURATION.theme, ease: EASE_PREMIUM }}
              >
                <Image
                  src={IMAGE_LIGHT}
                  alt="Model wearing the new Nuvora linen collection"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: isDark ? 1 : 0 }}
                transition={{ duration: DURATION.theme, ease: EASE_PREMIUM }}
              >
                <Image
                  src={IMAGE_DARK}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: NOISE_BG }}
                aria-hidden="true"
              />
            </motion.div>
          </div>

          {/* Floating product tag - matte paper surface, editorial copy, no rating */}
          <HeroHotspot hotspotX={hotspotX}  hotspotY={hotspotY}/>
        </motion.div>
    </>
  );
};

export default HeroImage;
