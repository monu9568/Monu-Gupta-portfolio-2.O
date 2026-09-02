"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers, Terminal, Briefcase, User, Mail, ShieldCheck, Menu, X } from "lucide-react";
import Link from "next/link";

import { SiteSettingsData, NavItem } from "@/lib/types";

interface NavbarProps {
  activeSection?: string;
  settings?: SiteSettingsData;
}

const getNavIcon = (name?: string, id?: string) => {
  const lower = (name || id || "").toLowerCase();
  if (lower.includes("home")) return Sparkles;
  if (lower.includes("project") || lower.includes("work") || lower.includes("case")) return Layers;
  if (lower.includes("skill") || lower.includes("tech") || lower.includes("stack")) return Terminal;
  if (lower.includes("exp") || lower.includes("career") || lower.includes("milestone")) return Briefcase;
  if (lower.includes("about") || lower.includes("bio") || lower.includes("journey") || lower.includes("story")) return User;
  if (lower.includes("contact") || lower.includes("dialogue") || lower.includes("mail") || lower.includes("inquiry")) return Mail;
  return Sparkles;
};

const defaultNavList: NavItem[] = [
  { id: "home", label: "Home", href: "#home", visible: true },
  { id: "projects", label: "Projects", href: "#projects", visible: true },
  { id: "skills", label: "Skills", href: "#skills", visible: true },
  { id: "experience", label: "Experience", href: "#experience", visible: true },
  { id: "about", label: "About", href: "#about", visible: true },
  { id: "contact", label: "Contact", href: "#contact", visible: true },
];

export default function Navbar({ activeSection = "home", settings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(activeSection);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Secret CMS unlock sequence (2 taps on MG, 5 taps on secret spot within 6 seconds)
  const [mgTaps, setMgTaps] = useState(0);
  const [secretTaps, setSecretTaps] = useState(0);
  const [isCmsUnlocked, setIsCmsUnlocked] = useState(false);
  const unlockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMgTap = (e: React.MouseEvent) => {
    if (isCmsUnlocked) return;

    if (mgTaps === 0) {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = setTimeout(() => {
        setMgTaps(0);
        setSecretTaps(0);
      }, 6000);
      setMgTaps(1);
      setSecretTaps(0);
    } else if (mgTaps === 1) {
      setMgTaps(2); // Exactly 2 taps registered
    } else {
      // If tapped a 3rd time or more, reset sequence
      setMgTaps(0);
      setSecretTaps(0);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    }
  };

  const handleSecretTap = (e: React.MouseEvent) => {
    if (isCmsUnlocked) return;

    // Must have EXACTLY 2 taps on MG
    if (mgTaps !== 2) {
      setMgTaps(0);
      setSecretTaps(0);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      return;
    }

    if (secretTaps === 0) setSecretTaps(1);
    else if (secretTaps === 1) setSecretTaps(2);
    else if (secretTaps === 2) setSecretTaps(3);
    else if (secretTaps === 3) setSecretTaps(4);
    else if (secretTaps === 4) {
      // Exactly 5th tap completes the unlock sequence!
      setMgTaps(0);
      setSecretTaps(0);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);

      // Reveal smoothly after brief delay
      setTimeout(() => {
        setIsCmsUnlocked(true);
        // Keep CMS icon visible for 45 seconds
        unlockTimerRef.current = setTimeout(() => {
          setIsCmsUnlocked(false);
        }, 35000);
      }, 200);
    } else {
      // If tapped more than 5 times without unlocking, reset
      setMgTaps(0);
      setSecretTaps(0);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    }
  };

  const monogram = settings?.headerMonogram || "MG";
  const rawNavItems = settings?.navItems && settings.navItems.length > 0 ? settings.navItems : defaultNavList;
  const navItems = rawNavItems.filter((item) => item.visible !== false);

  // Close mobile drawer on outside click or touch anywhere on screen
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section detection based on active nav items
      const sections = navItems.map((n) => n.href.replace(/^#/, "")).filter(Boolean);
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  return (
    <>
      {/* Desktop Floating VisionOS Island */}
      <header className="fixed top-6 inset-x-0 z-40 hidden md:flex justify-center pointer-events-none px-4">
        <motion.nav
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-500 ${scrolled
              ? "bg-[#0c1017]/70 backdrop-blur-2xl border border-white/15 shadow-glass-elevated py-2 px-3"
              : "bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-glass py-1.5 px-2"
            }`}
        >
          {/* Brand Monogram (Secret Tap Target 1: 2 taps) */}
          <a
            href="#home"
            onClick={handleMgTap}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/20 text-white font-semibold text-xs tracking-wider transition-transform hover:scale-105 mr-1"
          >
            {monogram}
          </a>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const secId = item.href.replace(/^#/, "");
              const isActive = currentSection === secId || currentSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Secret Right Spot (Hidden target that requires 5 taps after 2 MG taps) */}
          <AnimatePresence>
            {isCmsUnlocked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <div className="h-4 w-px bg-white/10 mx-1" />
                <Link
                  href="/admin?access=mg_studio"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  title="Open Admin CMS"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">CMS</span>
                </Link>
              </motion.div>
            ) : (
              <div
                onClick={handleSecretTap}
                className="h-7 w-4 cursor-default select-none pointer-events-auto"
                title=""
              />
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* Mobile Top Floating Bar */}
      <div className="fixed top-4 inset-x-4 z-40 flex md:hidden items-center justify-between pointer-events-none">
        {/* Brand Monogram (Secret Tap Target 1: 2 taps) */}
        <a
          href="#home"
          onClick={handleMgTap}
          className="pointer-events-auto flex items-center justify-center h-10 w-10 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 text-white font-semibold text-xs shadow-glass"
        >
          {monogram}
        </a>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Secret Right Spot / Revealed CMS Icon on Mobile */}
          <AnimatePresence>
            {isCmsUnlocked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href="/admin?access=mg_studio"
                  className="flex items-center justify-center h-10 w-10 rounded-2xl bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                  title="Admin CMS"
                >
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              <div
                onClick={handleSecretTap}
                className="h-10 w-8 pointer-events-auto select-none"
                title=""
              />
            )}
          </AnimatePresence>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 text-white shadow-glass"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Glass Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md md:hidden pointer-events-auto cursor-pointer"
            />

            <motion.div
              ref={drawerRef}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-[#090b10]/95 backdrop-blur-3xl border border-white/15 p-6 shadow-glass-elevated md:hidden pointer-events-auto"
            >
              <div className="grid grid-cols-2 gap-3">
                {navItems.map((item) => {
                  const Icon = getNavIcon(item.label, item.id);
                  const secId = item.href.replace(/^#/, "");
                  const isActive = currentSection === secId || currentSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-medium transition-all ${isActive
                          ? "bg-white/[0.1] border-cyan-400/30 text-white shadow-glow-accent"
                          : "bg-white/[0.03] border-white/10 text-slate-300 hover:text-white"
                        }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Monu Gupta • Portfolio</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Available for Projects
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
