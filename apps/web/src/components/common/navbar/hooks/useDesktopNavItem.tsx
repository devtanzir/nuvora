import { useCallback, useEffect, useRef, useState } from "react";

const useDesktopNavItem = (isTransparent: boolean) => {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

const linkColor = isTransparent
  ? "text-white/80 hover:text-white hover:bg-white/10 rounded-full px-3 py-1"
  : "text-foreground hover:text-foreground hover:bg-foreground/8 rounded-full px-3 py-1";

  return {
    open,
    ref,
    handleMouseEnter,
    handleMouseLeave,
    linkColor
  }
};

export default useDesktopNavItem;
