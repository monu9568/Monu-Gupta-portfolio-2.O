"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // Disable Lenis completely on admin dashboard or mobile touch screens for 100% native 120Hz scrolling
    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

    if (isAdmin || isTouch) {
      if (lenisRef.current) {
        lenisRef.current.destroy?.();
        lenisRef.current = null;
      }
      return;
    }

    let animId: number;
    let isCancelled = false;

    // Dynamically import Lenis only when on desktop mouse environment
    import("lenis").then(({ default: Lenis }) => {
      if (isCancelled) return;

      const lenis = new Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.9,
        infinite: false,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        animId = requestAnimationFrame(raf);
      }

      animId = requestAnimationFrame(raf);
    });

    return () => {
      isCancelled = true;
      if (animId) cancelAnimationFrame(animId);
      if (lenisRef.current) {
        lenisRef.current.destroy?.();
        lenisRef.current = null;
      }
    };
  }, [isAdmin]);

  return <>{children}</>;
}

