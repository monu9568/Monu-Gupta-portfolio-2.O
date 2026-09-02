"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Github, Cpu, ShieldCheck, Zap, Layers, Activity, CheckCircle2, ChevronRight } from "lucide-react";
import Image from "next/image";
import SmartMedia from "../ui/SmartMedia";
import { ProjectData } from "@/lib/types";

interface CaseStudyModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setActiveMediaIndex(0);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);


  if (!project) return null;

  // Aggregate all unique media assets (video demonstration + thumbnail + gallery images)
  const mediaList: { url: string; label: string; isVideo: boolean }[] = [];
  
  if (project.videoUrl) {
    mediaList.push({ url: project.videoUrl, label: "Live Demonstration", isVideo: true });
  }

  if (project.thumbnail && !mediaList.some((m) => m.url === project.thumbnail)) {
    const isVid = Boolean(project.thumbnail.match(/\.(mp4|webm|mov)$/i) || project.thumbnail.includes("/video/"));
    mediaList.push({ url: project.thumbnail, label: isVid ? "Video Showcase" : "Primary Showcase", isVideo: isVid });
  }

  if (Array.isArray(project.gallery)) {
    project.gallery.forEach((url, i) => {
      if (url && !mediaList.some((m) => m.url === url)) {
        const isVid = Boolean(url.match(/\.(mp4|webm|mov)$/i) || url.includes("/video/"));
        mediaList.push({ url, label: isVid ? `Video Reel ${i + 1}` : `Screen Capture ${i + 1}`, isVideo: isVid });
      }
    });
  }

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || { url: project.thumbnail, label: "Showcase", isVideo: false };

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto overscroll-contain"
      >
        {/* Backdrop Frosted Dark Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#040609]/85 backdrop-blur-2xl"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          data-lenis-prevent
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#090c13]/95 border border-white/20 shadow-glass-elevated backdrop-blur-3xl z-10 text-left custom-modal-scroll"
        >
          {/* Top Sticky Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-[#090c13]/80 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                {project.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {project.status}
              </span>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white transition-all hover:scale-105 active:scale-95"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 md:p-10 space-y-10">
            {/* Title and Subtitle */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                {project.title}
              </h2>
              <p className="text-lg text-slate-300 font-light leading-relaxed">
                {project.subtitle}
              </p>
            </div>

            {/* Main Interactive Media Multi-Preview Gallery Showcase */}
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-glass flex items-center justify-center">
                <SmartMedia
                  src={currentMedia.url}
                  alt={project.title}
                  fill
                  controls={currentMedia.isVideo}
                  autoPlay
                  className="object-contain w-full h-full"
                />
              </div>

              {/* Multi-Preview Thumbnails & Selector Strip */}
              {mediaList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scroll">
                  {mediaList.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`group relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border p-1 text-left transition-all ${
                        activeMediaIndex === idx
                          ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-105"
                          : "border-white/10 bg-white/[0.02] opacity-70 hover:opacity-100 hover:border-white/30"
                      }`}
                    >
                      <div className="relative h-full w-full rounded-lg overflow-hidden bg-black/50">
                        <SmartMedia src={media.url} alt={media.label} fill showBadge={media.isVideo} className="object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Performance KPIs & Tech Stack Strip */}
            <div className={`grid gap-4 ${project.performance ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {project.performance && (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                    <Activity className="h-4 w-4" />
                    <span>Performance Benchmark</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono tracking-tight">
                    {project.performance}
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                  <Cpu className="h-4 w-4" />
                  <span>Technologies Utilized</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-medium text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Case Study Content Breakdown (Only if enabled and provided) */}
            {project.hasCaseStudy !== false && Boolean(project.problem || project.solution || project.architecture || project.impact) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10">
                {/* Problem Statement */}
                {project.problem && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      The Architectural Challenge
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-light">
                      {project.problem}
                    </p>
                  </div>
                )}

                {/* Solution */}
                {project.solution && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      The Engineered Solution
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-light">
                      {project.solution}
                    </p>
                  </div>
                )}

                {/* Architecture Deep Dive */}
                {project.architecture && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      System Architecture
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-light">
                      {project.architecture}
                    </p>
                  </div>
                )}

                {/* Measured Impact */}
                {project.impact && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Verified Results & Impact
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-light">
                      {project.impact}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* External Links Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-medium text-sm transition-all hover:scale-105 active:scale-95 shadow-glow-accent"
                  >
                    <span>Launch Live Experience</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-medium text-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Github className="h-4 w-4" />
                    <span>Inspect Codebase</span>
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Press ESC to close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
