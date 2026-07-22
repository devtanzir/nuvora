import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const useNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { openSearch } = useUIStore();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  const { isAuthenticated } = useAuthStore();

  // Track scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = !scrolled;

  // Icon color classes based on scroll
  const iconColor = isTransparent
    ? 'hover:text-[#B58B45]'
    : 'text-foreground hover:text-[#B58B45]';

    return {
      scrolled,
      mobileOpen,
      setMobileOpen,
      openSearch,
      theme,
      setTheme,
      isDarkMode,
      toggleTheme,
      isAuthenticated,
      isTransparent,
      iconColor
    }
    };

export default useNavbar;
