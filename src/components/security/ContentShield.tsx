"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Lock, ShieldCheck } from "lucide-react";
import { SiteSettingsData } from "@/lib/types";

interface ContentShieldProps {
  settings?: SiteSettingsData;
}

export default function ContentShield({ settings }: ContentShieldProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const blockScreenshots = settings?.blockScreenshots !== false;
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
    }, 2800);
  }, []);

  const triggerPrivacyBlackout = useCallback((reason: string) => {
    setIsPrivacyObscured(true);
    // Clear clipboard content immediately
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("");
      }
    } catch {}

    if (blackoutTimeoutRef.current) clearTimeout(blackoutTimeoutRef.current);
    blackoutTimeoutRef.current = setTimeout(() => {
      // If window still has focus, restore view
      if (typeof document !== "undefined" && document.hasFocus()) {
        setIsPrivacyObscured(false);
      }
    }, 1800);

    showSecurityToast(reason);
  }, [showSecurityToast]);

  useEffect(() => {
    if (isAdmin || typeof window === "undefined") return;

    // 1. Right-Click Prevention (All mouse & touch context actions)
    const handleContextMenu = (e: MouseEvent) => {
      if (disableRightClick) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast("Content Protection: Right-click is disabled to protect intellectual property.");
        return false;
      }
    };

    // 2. Drag & Drop Prevention on all media
    const handleDragStart = (e: DragEvent) => {
      if (disableMediaSave) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Capture-Phase Key Interceptions (Handles Win + PrtScn, PrtScn, Ctrl+P, etc.)
    const handleKeyIntercept = (e: KeyboardEvent) => {
      if (!blockScreenshots) return;

      const isPrtScn =
        e.key === "PrintScreen" ||
        e.code === "PrintScreen" ||
        e.keyCode === 44 ||
        e.which === 44;

      if (isPrtScn) {
        e.preventDefault();
        e.stopPropagation();
        triggerPrivacyBlackout("Screen capture intercepted. Content protected.");
        return false;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Save Page (Ctrl+S / Cmd+S)
      if (ctrlOrCmd && (e.key === "s" || e.key === "S" || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast("Page saving is restricted.");
        return false;
      }

      // Print Page (Ctrl+P / Cmd+P)
      if (ctrlOrCmd && (e.key === "p" || e.key === "P" || e.keyCode === 80)) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast("Printing is restricted.");
        return false;
      }

      // View Source (Ctrl+U / Cmd+U)
      if (ctrlOrCmd && (e.key === "u" || e.key === "U" || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // DevTools Inspection (F12 or Ctrl+Shift+I / J / C)
      if (
        e.key === "F12" ||
        e.keyCode === 123 ||
        (ctrlOrCmd && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast("Developer inspection shortcut intercepted.");
        return false;
      }
    };

    // 4. Window Focus Loss / Snipping Tool Blur Defense
    const handleWindowBlur = () => {
      if (blockScreenshots) {
        setIsPrivacyObscured(true);
        try {
          document.documentElement.classList.add("window-blurred");
        } catch {}
      }
    };

    const handleWindowFocus = () => {
      if (blockScreenshots) {
        setIsPrivacyObscured(false);
        try {
          document.documentElement.classList.remove("window-blurred");
        } catch {}
      }
    };

    const handleVisibilityChange = () => {
      if (blockScreenshots) {
        if (document.hidden) {
          setIsPrivacyObscured(true);
          try {
            document.documentElement.classList.add("window-blurred");
          } catch {}
        } else {
          setIsPrivacyObscured(false);
          try {
            document.documentElement.classList.remove("window-blurred");
          } catch {}
        }
      }
    };


    // 5. Prevent copy/cut payload theft
    const handleCopyCut = (e: ClipboardEvent) => {
      if (disableMediaSave) {
        try {
          if (e.clipboardData) {
            e.clipboardData.setData("text/plain", "Protected Content • © Monu Gupta (monugupta.design)");
            e.preventDefault();
          }
        } catch {}
      }
    };

    // Attach in CAPTURE phase to intercept before OS/browser bubbling
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("keydown", handleKeyIntercept, { capture: true });
    window.addEventListener("keyup", handleKeyIntercept, { capture: true });
    window.addEventListener("blur", handleWindowBlur, { capture: true });
    window.addEventListener("focus", handleWindowFocus, { capture: true });
    document.addEventListener("visibilitychange", handleVisibilityChange, { capture: true });
    document.addEventListener("copy", handleCopyCut, { capture: true });
    document.addEventListener("cut", handleCopyCut, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true } as any);
      window.removeEventListener("dragstart", handleDragStart, { capture: true } as any);
      window.removeEventListener("keydown", handleKeyIntercept, { capture: true } as any);
      window.removeEventListener("keyup", handleKeyIntercept, { capture: true } as any);
      window.removeEventListener("blur", handleWindowBlur, { capture: true } as any);
      window.removeEventListener("focus", handleWindowFocus, { capture: true } as any);
      document.removeEventListener("visibilitychange", handleVisibilityChange, { capture: true } as any);
      document.removeEventListener("copy", handleCopyCut, { capture: true } as any);
      document.removeEventListener("cut", handleCopyCut, { capture: true } as any);

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (blackoutTimeoutRef.current) clearTimeout(blackoutTimeoutRef.current);
    };
  }, [isAdmin, blockScreenshots, disableRightClick, disableMediaSave, triggerPrivacyBlackout, showSecurityToast]);

  if (isAdmin) return null;

  return (
    <>
      {/* Dynamic Digital Rights Specular Watermark Matrix */}
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Privacy Obscuration Shield (Fires on Snipping Tool Win+Shift+S, Win+PrtScn, or Window Blur) */}
      <AnimatePresence>
        {isPrivacyObscured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[999999] pointer-events-none bg-[#06070a]/98 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6 select-none"
          >
            <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-glass">
              <Lock className="h-7 w-7" />
            </div>
            <p className="text-sm font-mono text-cyan-300 uppercase tracking-widest">
              Digital Rights Protected
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-light">
              This portfolio and its media assets are encrypted against unauthorized capture.
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

