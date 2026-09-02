"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { SiteSettingsData } from "@/lib/types";

interface FooterProps {
  settings?: SiteSettingsData;
}

export default function Footer({ settings }: FooterProps) {
  const [timeStr, setTimeStr] = useState("");

  const showFooter = settings?.showFooter !== false;
  const monogram = settings?.footerMonogram || "MG";
  const name = settings?.footerName || "Monu Gupta";
  const copyright = settings?.footerCopyright || `© ${new Date().getFullYear()} • All Rights Reserved`;
  const statusTag = settings?.footerStatusTag || "All Systems Operational";
  const showClock = settings?.showLiveClock !== false;
  const showBackToTop = settings?.showBackToTop !== false;
  const footerLinks = settings?.footerLinks || [];

  useEffect(() => {
    if (!showClock) return;
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [showClock]);

  if (!showFooter) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#040609]/80 backdrop-blur-2xl py-12 px-4 md:px-8 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs font-mono text-slate-400">
        
        {/* Left: Brand Monogram & Copyright */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-white font-bold text-xs">
            {monogram}
          </div>
          <div>
            <span className="text-slate-300 font-medium">{name}</span>
            <span className="text-slate-500 ml-2">{copyright}</span>
          </div>
        </div>

        {/* Center: System Status & Live Clock & Custom Links */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {statusTag && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">{statusTag}</span>
            </div>
          )}

          {showClock && (
            <div className="text-slate-400">
              LOC: <span className="text-slate-200">{timeStr || "00:00:00"}</span>
            </div>
          )}

          {footerLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CMS Gateway & Scroll to Top */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Admin CMS"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </Link>

          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white transition-all hover:scale-105 active:scale-95"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>
    </footer>
  );
}
