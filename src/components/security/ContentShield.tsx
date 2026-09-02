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
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSecurityToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

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

    // 3. Safe Keystroke Protection (Save & Print)
    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [isAdmin, disableRightClick, disableMediaSave, showSecurityToast]);

  if (isAdmin) return null;

  return (
    <>
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


