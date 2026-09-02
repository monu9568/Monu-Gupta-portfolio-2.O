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
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 md:px-8 lg:px-16 overflow-hidden"
    >
      {/* Background Liquid Ambient Glow Orbs */}
      <div className="liquid-glow-1 top-1/4 left-1/10 h-[500px] w-[500px]" />
      <div className="liquid-glow-2 bottom-1/4 right-1/10 h-[550px] w-[550px]" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">

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
