"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dismiss preloader smoothly and instantly (100ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    const handleDismiss = () => {
      setLoading(false);
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      handleDismiss();
    } else {
      window.addEventListener("DOMContentLoaded", handleDismiss, { once: true });
      window.addEventListener("load", handleDismiss, { once: true });
    }

    // Dismiss immediately on touch or scroll
    window.addEventListener("touchstart", handleDismiss, { once: true, passive: true });
    window.addEventListener("scroll", handleDismiss, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("DOMContentLoaded", handleDismiss);
      window.removeEventListener("load", handleDismiss);
      window.removeEventListener("touchstart", handleDismiss);
      window.removeEventListener("scroll", handleDismiss);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06070a] pointer-events-none select-none"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

          {/* Central Luxury Emblem */}
          <div className="relative flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center h-20 w-20">
              {/* Outer rotating glowing ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border border-cyan-400/30 border-t-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
              />

              {/* Inner counter-rotating ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-xl border border-white/15 border-b-cyan-300"
              />

              {/* Core Monogram */}
              <span className="text-xl font-bold font-mono tracking-wider text-white">
                MG
              </span>
            </div>

            {/* Typography */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg sm:text-xl font-bold tracking-[0.25em] text-white uppercase font-sans"
              >
                Monu Gupta
              </motion.h1>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[11px] font-mono tracking-[0.3em] text-cyan-400 uppercase"
              >
                Portfolio
              </motion.span>
            </div>

            {/* Sleek Progress Line */}
            <div className="w-36 h-[2px] rounded-full bg-white/10 overflow-hidden mt-1">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
