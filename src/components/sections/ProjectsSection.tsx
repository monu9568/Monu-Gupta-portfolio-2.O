"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, Sparkles, Layers, ChevronRight, ChevronLeft, Eye, ExternalLink, ChevronDown } from "lucide-react";
import Image from "next/image";
import GlassCard from "../ui/GlassCard";
import SmartMedia from "../ui/SmartMedia";
import { ProjectData } from "@/lib/types";

const CaseStudyModal = dynamic(() => import("./CaseStudyModal"), {
  ssr: false,
});


interface ProjectsSectionProps {
  projects: ProjectData[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [mobileShowAll, setMobileShowAll] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const INITIAL_MOBILE_COUNT = 4;
  const hasMoreMobile = filteredProjects.length > INITIAL_MOBILE_COUNT;

  return (
    <section id="projects" className="relative py-28 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="liquid-glow-2 top-1/3 left-1/4 h-[600px] w-[600px] opacity-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header & Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-400 mb-4">
              <Layers className="h-3.5 w-3.5" />
              <span>FEATURED WORK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Selected <span className="text-gradient-cyan">Projects</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl font-light">
              Production-ready web applications, modern interfaces, and interactive user experiences.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setMobileShowAll(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${selectedCategory === cat
                    ? "bg-white/[0.12] text-white shadow-glow-accent border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Controls (Carousel Scroll Arrows) */}
        <div className="hidden lg:flex items-center justify-end gap-2 mb-6">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 text-white transition-all hover:scale-105 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 text-white transition-all hover:scale-105 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop Horizontal Scroll & Mobile Vertical Grid */}
        <div
          ref={scrollContainerRef}
          className="flex flex-col lg:flex-row gap-8 lg:overflow-x-auto lg:pb-8 lg:snap-x lg:snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredProjects.map((project, idx) => {
            const isHiddenOnMobile = !mobileShowAll && idx >= INITIAL_MOBILE_COUNT;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`lg:min-w-[440px] lg:max-w-[440px] lg:snap-start flex-shrink-0 ${
                  isHiddenOnMobile ? "hidden lg:block" : "block"
                }`}
              >
                <GlassCard
                  tilt
                  elevated
                  className="group h-full flex flex-col justify-between p-6 cursor-pointer border border-white/15 hover:border-cyan-400/40 hover:shadow-glow-accent transition-all duration-500"
                  onClick={() => setSelectedProject(project)}
                >
                  <div>
                    {/* Card Media Preview */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 mb-6">
                      <SmartMedia
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        showBadge
                        poster={(project.gallery || []).find((g) => g && !g.match(/\.(mp4|webm|mov)$/i)) || "/images/personal/cube-studio.webp"}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 440px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Top Floating Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-cyan-300">
                          {project.category}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {project.status}
                        </span>
                      </div>

                      {/* Hover Quick Action Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 font-medium text-xs shadow-glass">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </div>
                      </div>
                    </div>


                    {/* Project Title & Short Subtitle */}
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm font-light line-clamp-2 leading-relaxed mb-5">
                      {project.subtitle}
                    </p>

                    {/* Technology Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.techStack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono text-slate-400">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions Strip */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-slate-400">
                      {project.performance ? project.performance.split("•")[0] : "Optimized Performance"}
                    </div>

                    <div className="flex items-center gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="GitHub Code"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Live Preview"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors ml-1">
                        <span>Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View More / Show Less Toggle Button */}
        {hasMoreMobile && (
          <div className="pt-8 flex lg:hidden justify-center">
            <button
              onClick={() => setMobileShowAll(!mobileShowAll)}
              className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 backdrop-blur-xl text-white font-medium text-xs tracking-wider font-mono transition-all duration-300 hover:border-cyan-400/40 hover:scale-105 active:scale-95 shadow-glass"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                {mobileShowAll
                  ? "Show Less Projects"
                  : `View More Projects (${filteredProjects.length - INITIAL_MOBILE_COUNT} more)`}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-cyan-400 transition-transform duration-300 ${
                  mobileShowAll ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Full-Screen Glass Case Study Modal */}
      <CaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
