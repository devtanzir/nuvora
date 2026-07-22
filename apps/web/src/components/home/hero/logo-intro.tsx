import NuvoraTextLogo from "@/components/common/icons/nuvora-text-logo";
import { AnimatePresence, motion } from "framer-motion";
import { DURATION, EASE_PREMIUM } from "../constants/hero-constants";
import { LogoIntroProps } from "../interface/hero";

const LogoIntro = ({logoVisible, isDarkMode}: LogoIntroProps) => {
  return (
    <>
      <AnimatePresence>
        {logoVisible && (
          <motion.div
            key="intro-logo"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.medium, ease: EASE_PREMIUM }}
          >
            <NuvoraTextLogo
              className="h-[100px] w-full -translate-x-5"
              isTransparent={false}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LogoIntro;
