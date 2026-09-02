"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Sparkles, Monitor, Layers } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SmartMedia from "../ui/SmartMedia";
import { AboutData } from "@/lib/types";

interface AboutSectionProps {
  about: AboutData;
  avatarImg?: string;
}

export default function AboutSection({
  about,
  avatarImg = "/images/personal/cube-front.png",
}: AboutSectionProps) {
  const visiblePillars = (about.coreValues || []).filter((v) => v.visible !== false);
  const showPhoto = about.showPhotoCard !== false;

  return (
    <section id="about" className="relative py-28 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Background Liquid Glow */}
      <div className="liquid-glow-2 top-1/4 right-1/10 h-[500px] w-[500px] opacity-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          {about.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-400 mb-4">
              <User className="h-3.5 w-3.5" />
              <span>{about.badge}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            {about.titlePrefix || "My"}{" "}
            <span className="text-gradient-cyan">{about.titleGradient || "Journey"}</span>
          </h2>
          {about.subtitle && (
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl font-light">
              {about.subtitle}
            </p>
          )}
        </div>

        {/* Narrative & Photo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          {/* Narrative Story Cards */}
          <div className={showPhoto ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
            <GlassCard elevated className="p-8 border border-white/15 space-y-6">
              {about.showStoryTitle !== false && about.storyTitle && (
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  <span>{about.storyTitle}</span>
                </h3>
              )}
              {about.showStoryParagraph1 !== false && about.storyParagraph1 && (
                <p className="text-slate-300 text-base leading-relaxed font-light">
                  {about.storyParagraph1}
                </p>
              )}
              {about.showStoryParagraph2 !== false && about.storyParagraph2 && (
                <p className="text-slate-300 text-base leading-relaxed font-light">
                  {about.storyParagraph2}
                </p>
              )}
              {(about.additionalParagraphs || []).map((p, idx) => (
                <p key={idx} className="text-slate-300 text-base leading-relaxed font-light">
                  {p}
                </p>
              ))}
            </GlassCard>

            {/* Hardware & Spatial Rig Card */}
            {about.showHardwareSpecs !== false && (about.hardwareSpecs || []).length > 0 && (
              <GlassCard className="p-6 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">
                  <Monitor className="h-4 w-4" />
                  <span>{about.hardwareTitle || "Studio Environment & Instruments"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {about.hardwareSpecs.map((spec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-[11px] font-mono text-slate-400 uppercase">
                        {spec.label}
                      </span>
                      <span className="text-xs font-medium text-slate-200 mt-0.5 block">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Luxury Photo Showcase */}
          {showPhoto && (
            <div className="lg:col-span-5 h-full flex flex-col justify-start">
              <GlassCard
                elevated
                className="relative h-[540px] w-full overflow-hidden rounded-3xl border border-white/15 p-2 shadow-glass-elevated"
              >
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#090b10]">
                  <SmartMedia
                    src={about.photoUrl || avatarImg || "/images/personal/cube-front.png"}
                    alt={about.photoOverlayName || "Studio Portrait"}
                    fill
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 inset-x-6 z-10">
                    {about.photoOverlayTag && (
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                        {about.photoOverlayTag}
                      </span>
                    )}
                    {about.photoOverlayName && (
                      <span className="text-xl font-bold text-white tracking-tight block">
                        {about.photoOverlayName}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Philosophy Core Pillars */}
        {about.showPhilosophy !== false && visiblePillars.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight mb-8">
              {about.philosophyTitle || "Core Principles"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visiblePillars.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlassCard className="p-6 h-full border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold mb-4">
                      0{idx + 1}
                    </div>
                    <h4 className="text-base font-semibold text-white tracking-tight mb-2">
                      {val.title}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">
                      {val.desc}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
