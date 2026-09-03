"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { SiteSettingsData } from "@/lib/types";

interface ContentShieldProps {
  settings?: SiteSettingsData;
}

export default function ContentShield({ settings }: ContentShieldProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const disableRightClick = settings?.disableRightClick !== false;
  const disableMediaSave = settings?.disableMediaSave !== false;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPrivacyObscured, setIsPrivacyObscured] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blackoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSecurityToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const triggerAntiCaptureVeil = useCallback(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("privacy-blackout");
      document.body.classList.add("privacy-blackout");
      document.documentElement.style.setProperty("filter", "contrast(0) brightness(0)", "important");
      document.documentElement.style.setProperty("opacity", "0", "important");
    }

    setIsPrivacyObscured(true);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("");
      }
    } catch {}

    if (blackoutTimeoutRef.current) clearTimeout(blackoutTimeoutRef.current);
    blackoutTimeoutRef.current = setTimeout(() => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("privacy-blackout");
        document.body.classList.remove("privacy-blackout");
        document.documentElement.style.removeProperty("filter");
        document.documentElement.style.removeProperty("opacity");
      }
      setIsPrivacyObscured(false);
    }, 1500);

    showSecurityToast("Digital Rights Protected: Screen capture intercepted.");
  }, [showSecurityToast]);

  useEffect(() => {
    if (isAdmin || typeof window === "undefined") return;

    // 1. Right-Click Prevention
    const handleContextMenu = (e: MouseEvent) => {
      if (disableRightClick) {
        e.preventDefault();
        showSecurityToast("Content Protection: Right-click is disabled to protect intellectual property.");
        return false;
      }
    };

    // 2. Drag & Drop Prevention on images/videos
    const handleDragStart = (e: DragEvent) => {
      if (disableMediaSave) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Universal Capture-Phase Keystroke Interception (Win+PrtScn, PrtScn, Win+Shift+S, Save, Print)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Windows Key (Meta) or Command Key on laptops
      // Blanking occurs the exact millisecond Win is pressed, ensuring Win+PrtScn gets 100% black
      if (e.key === "Meta" || e.code === "OSLeft" || e.code === "MetaLeft" || e.code === "OSRight" || e.code === "MetaRight") {
        triggerAntiCaptureVeil();
      }

      // PrintScreen capture interception
      if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.keyCode === 44 || e.which === 44) {
        e.preventDefault();
        triggerAntiCaptureVeil();
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Mac Screenshot (Cmd + Shift + 3 / 4)
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S" || e.code === "KeyS" || e.key === "3" || e.key === "4" || e.code === "Digit3" || e.code === "Digit4")) {
        e.preventDefault();
        triggerAntiCaptureVeil();
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Save Page (Ctrl+S / Cmd+S)
      if (ctrlOrCmd && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        showSecurityToast("Page saving is restricted.");
        return false;
      }

      // Print Page (Ctrl+P / Cmd+P)
      if (ctrlOrCmd && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        showSecurityToast("Printing is restricted.");
        return false;
      }
    };



    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.keyCode === 44 || e.which === 44 || e.key === "Meta") {
        triggerAntiCaptureVeil();
      }
    };

    // 4. Smartphone 3-Finger Swipe Screenshot Interception
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        triggerAntiCaptureVeil();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        triggerAntiCaptureVeil();
      }
    };

    // 5. Smartphone Screenshot & Tab Backgrounding Defense
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        triggerAntiCaptureVeil();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    window.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", handleTouchMove, { capture: true, passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true } as any);
      window.removeEventListener("dragstart", handleDragStart, { capture: true } as any);
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
      window.removeEventListener("keyup", handleKeyUp, { capture: true } as any);
      window.removeEventListener("touchstart", handleTouchStart, { capture: true } as any);
      window.removeEventListener("touchmove", handleTouchMove, { capture: true } as any);
      document.removeEventListener("visibilitychange", handleVisibilityChange, { capture: true } as any);
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("privacy-blackout");
        document.body.classList.remove("privacy-blackout");
      }
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (blackoutTimeoutRef.current) clearTimeout(blackoutTimeoutRef.current);
    };


  }, [isAdmin, disableRightClick, disableMediaSave, triggerAntiCaptureVeil, showSecurityToast]);



  if (isAdmin) return null;

  return (
    <>
      {/* Dynamic Digital Rights Specular Watermark Matrix */}
      <div
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,189,248,0.4) 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Targeted Anti-Capture Instant Screen Privacy Veil (Triggers ONLY when PrintScreen / Win+PrtScn is pressed) */}
      <AnimatePresence>
        {isPrivacyObscured && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999999] pointer-events-none bg-[#06070a] flex flex-col items-center justify-center text-center p-6 select-none"
          >
            <p className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
              Digital Rights Protected
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-light">
              Screenshots and media captures are restricted on this portfolio.
            </p>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Floating Security Feedback Pill */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 inset-x-0 z-[99999] flex justify-center pointer-events-none px-4 select-none"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0e1420]/95 border border-cyan-400/30 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] text-xs font-sans text-slate-200">
              <ShieldAlert className="h-4 w-4 text-cyan-400 flex-shrink-0 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



