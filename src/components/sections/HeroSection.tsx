"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Terminal, Compass, Layers, ShieldCheck } from "lucide-react";
import { CanvasFallback } from "../3d/HeroCanvas";
import GlassCard from "../ui/GlassCard";
import { HeroData } from "@/lib/types";

const HeroCanvas = dynamic(() => import("../3d/HeroCanvas"), {
  ssr: false,
  loading: () => <CanvasFallback />,
});


interface HeroSectionProps {
  hero: HeroData;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const cubeImages = {
    front: hero.cubeFrontImg || "/images/personal/cube-front.png",
    right: hero.cubeRightImg || "/images/personal/cube-creative.png",
    back: hero.cubeBackImg || "/images/personal/cube-lifestyle.png",
    left: hero.cubeLeftImg || "/images/personal/cube-code.png",
    top: hero.cubeTopImg || "/images/personal/cube-studio.png",
    bottom: hero.cubeBottomImg || "/images/personal/cube-front.png",
  };

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] lg:min-h-screen flex items-center justify-center pt-20 pb-4 sm:pt-24 sm:pb-16 px-4 md:px-8 lg:px-16 overflow-hidden"
    >
      {/* Background Liquid Ambient Glow Orbs */}
      <div className="liquid-glow-1 top-1/4 left-1/10 h-[500px] w-[500px]" />
      <div className="liquid-glow-2 bottom-1/4 right-1/10 h-[550px] w-[550px]" />

      {/* ========================================================================= */}
      {/* MOBILE SINGLE-FRAME VIEW (lg:hidden) - Everything fits in 100vh viewport   */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden flex-col justify-between items-center text-center w-full min-h-[calc(100dvh-6rem)] relative z-10 py-1 max-w-md mx-auto">
        
        {/* Top: Availability Pill + Name + Skill Badges */}
        <div className="flex flex-col items-center w-full gap-2 flex-shrink-0">
          {hero.showAvailabilityTag !== false && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-[10px] font-mono text-slate-300 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>{hero.availabilityTag || "Available for Development & Data Projects"}</span>
            </div>
          )}

          {hero.showIdentitySubtitle !== false && (
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                {hero.name || "Monu Gupta"}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {(hero.title || "Full-Stack Developer • Data Analyst • AI & ML Solutions")
                  .split("•")
                  .map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 backdrop-blur-md text-[10px] font-mono text-cyan-300 shadow-sm"
                    >
                      {item.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: 3D Personal Identity Cube Canvas with Full Touch Momentum */}
        <div className="relative w-full h-[220px] sm:h-[260px] my-auto flex items-center justify-center flex-shrink-0">
          <HeroCanvas cubeImages={cubeImages} />
          
          {/* Subtle rotation guide pill */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-400">
              <Compass className="h-3 w-3 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Touch & drag to rotate 3D cube</span>
            </div>
          </div>
        </div>

        {/* Bottom: Main Headline + Bio + Dual Action Buttons */}
        <div className="flex flex-col items-center w-full gap-2.5 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            {hero.headlinePrefix !== undefined ? hero.headlinePrefix : "Turning Ideas"}{" "}
            <span className="text-gradient-cyan">
              {hero.headlineGradient !== undefined ? hero.headlineGradient : "Into Elegant"}
            </span>{" "}
            {hero.headlineSuffix !== undefined ? hero.headlineSuffix : "Digital Solutions."}
          </h1>

          <p className="text-xs text-slate-300/85 leading-relaxed max-w-sm font-light line-clamp-2">
            {hero.bio ||
              "I create modern websites, scalable applications, interactive dashboards, and intelligent data solutions by combining software engineering, analytics, and machine learning."}
          </p>

          {/* Dual Action Buttons (Side by Side in 1 row) */}
          <div className="flex items-center justify-center gap-2.5 w-full pt-1">
            <a
              href={hero.primaryCtaLink || "#projects"}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs transition-all duration-300 hover:bg-cyan-50 shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95"
            >
              <span>{hero.primaryCtaText || "View My Work"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <a
              href={hero.secondaryCtaLink || "#contact"}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 backdrop-blur-xl text-white font-semibold text-xs transition-all duration-300 hover:border-white/30 active:scale-95"
            >
              <span>{hero.secondaryCtaText || "Get in Touch"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (hidden lg:grid) - 100% Original 2-Column Wide Grid Layout     */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid max-w-7xl w-full mx-auto grid-cols-12 gap-8 items-center relative z-10">

        {/* Left Column: Narrative, Typography & Direct Actions */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left">

          {/* Availability Status Pill */}
          {hero.showAvailabilityTag !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-mono text-slate-300 w-fit mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{hero.availabilityTag || "Available for Development & Data Projects"}</span>
            </motion.div>
          )}

          {/* Main Title & Identity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {hero.showIdentitySubtitle !== false && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mb-4 sm:mb-5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                  {hero.name || "Monu Gupta"}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {(hero.title || "Full-Stack Developer • Data Analyst • AI & ML Solutions")
                    .split("•")
                    .map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] sm:text-xs font-mono text-cyan-300 shadow-sm"
                      >
                        {item.trim()}
                      </span>
                    ))}
                </div>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
              {hero.headlinePrefix !== undefined ? hero.headlinePrefix : "Turning Ideas"}{" "}
              <br />
              <span className="text-gradient-cyan">
                {hero.headlineGradient !== undefined ? hero.headlineGradient : "Into Elegant"}
              </span>{" "}
              <br />
              {hero.headlineSuffix !== undefined ? hero.headlineSuffix : "Digital Solutions."}
            </h1>
          </motion.div>

          {/* Subtext / Bio */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mb-8 font-light"
          >
            {hero.bio ||
              "I create modern websites, scalable applications, interactive dashboards, and intelligent data solutions by combining software engineering, analytics, and machine learning."}
          </motion.p>

          {/* Interactive CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <a
              href={hero.primaryCtaLink || "#projects"}
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-950 font-medium text-sm transition-all duration-300 hover:bg-cyan-50 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{hero.primaryCtaText || "View My Work"}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <a
              href={hero.secondaryCtaLink || "#contact"}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 backdrop-blur-xl text-white font-medium text-sm transition-all duration-300 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{hero.secondaryCtaText || "Get in Touch"}</span>
            </a>
          </motion.div>

          {/* Floating Key Metrics Pill Bar */}
          {hero.showStats !== false && (hero.stats || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`grid gap-3 max-w-xl ${(hero.stats || []).length === 1
                ? "grid-cols-1"
                : (hero.stats || []).length === 2
                  ? "grid-cols-2"
                  : (hero.stats || []).length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
            >
              {(hero.stats || []).map((stat) => (
                <div key={stat.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md text-left">
                  <span className={`block text-xl sm:text-2xl font-bold tracking-tight ${stat.color || "text-white"}`}>
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Column: 3D Personal Identity Glass Cube Canvas */}
        <div className="lg:col-span-6 relative flex items-center justify-center h-[460px] lg:h-[560px] w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 0.9 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative"
          >
            {/* Interactive 3D Canvas */}
            <HeroCanvas cubeImages={cubeImages} />

            {/* Micro Interaction Guide Floating Tag */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-[11px] font-mono text-slate-400 shadow-glass">
                <Compass className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Move cursor or drag to rotate 3D glass cube</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

