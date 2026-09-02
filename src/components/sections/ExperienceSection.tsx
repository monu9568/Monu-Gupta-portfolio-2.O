"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Award, CheckCircle2, X, ExternalLink, Eye, Sparkles, ChevronDown, MapPin } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SmartMedia from "../ui/SmartMedia";
import { ExperienceData } from "@/lib/types";

interface ExperienceSectionProps {
  experience: ExperienceData[];
}

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<{ url: string; title: string; company: string } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const INITIAL_LIMIT = 4;
  const displayedExperience = showAll ? experience : experience.slice(0, INITIAL_LIMIT);
  const hasMore = experience.length > INITIAL_LIMIT;

  return (
    <section id="experience" className="relative py-28 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Background Liquid Ambient Glow */}
      <div className="liquid-glow-1 bottom-1/3 left-1/3 h-[500px] w-[500px] opacity-10" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-400 mb-4">
            <Briefcase className="h-3.5 w-3.5" />
            <span>CAREER & MILESTONES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Experience & <span className="text-gradient-cyan">Milestones</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-light">
            A journey through projects, technical growth, internships, and continuous learning.          </p>
        </div>

        {/* Timeline Rail & Cards */}
        <div className="relative border-l border-white/10 ml-4 sm:ml-8 md:ml-32 space-y-12 pl-6 sm:pl-10">
          <AnimatePresence initial={false}>
            {displayedExperience.map((exp, idx) => (
              <motion.div
                key={exp.id || idx}
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -20, y: 20 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                {/* Timeline Glowing Node */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-6 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.8)] transition-all duration-300" />
                </div>

                {/* Date Tag Left Indicator on Desktop */}
                <div className="hidden md:block absolute -left-48 top-5 text-right w-36">
                  {exp.period && (
                    <span className="text-xs font-mono font-medium text-cyan-400 tracking-wider block">
                      {exp.period}
                    </span>
                  )}
                  {exp.type && exp.type !== "None" && exp.type.trim() !== "" && (
                    <span className="block text-[11px] font-mono text-slate-500 mt-0.5">
                      {exp.type}
                    </span>
                  )}
                </div>

                <GlassCard
                  elevated
                  className="p-6 sm:p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
                >
                  {/* Mobile Date Tag */}
                  {(exp.period || (exp.type && exp.type !== "None" && exp.type.trim() !== "")) && (
                    <div className="md:hidden flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                      {exp.period ? (
                        <span className="text-xs font-mono text-cyan-400 font-medium">{exp.period}</span>
                      ) : (
                        <span />
                      )}
                      {exp.type && exp.type !== "None" && exp.type.trim() !== "" && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-mono text-slate-400">
                          {exp.type}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Role and Company */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {exp.role}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium flex-wrap">
                      <span className="text-cyan-300">@{exp.company}</span>
                      {exp.location && exp.location.trim() !== "" && (
                        <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
                          • <MapPin className="h-3 w-3 text-slate-500" /> {exp.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {exp.description && exp.description.trim() !== "" && (
                    <p className="text-slate-300 text-sm leading-relaxed font-light mb-5">
                      {exp.description}
                    </p>
                  )}

                  {/* Verified Certificate / Credential Badge Card */}
                  {exp.certificateUrl && (
                    <div
                      onClick={() =>
                        setSelectedCertificate({
                          url: exp.certificateUrl!,
                          title: exp.certificateTitle || `${exp.role} Credential`,
                          company: exp.company,
                        })
                      }
                      className="group/cert mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-indigo-950/20 border border-cyan-500/25 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                    >
                      <div className="relative h-16 w-24 rounded-xl overflow-hidden border border-white/15 bg-black/60 flex-shrink-0 group-hover/cert:scale-105 transition-transform">
                        <SmartMedia src={exp.certificateUrl} alt={exp.certificateTitle || "Certificate"} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover/cert:bg-transparent transition-colors" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
                          <Award className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Verified Credential & Certificate</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate">
                          {exp.certificateTitle || `${exp.role} Verification`}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5 group-hover/cert:text-cyan-300 transition-colors">
                          <Eye className="h-3 w-3" /> Click to view full credential
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Achievements list */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {exp.achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 font-light">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Technologies used */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                      {exp.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* See More / Show Less Toggle Button after 4 Milestones */}
        {hasMore && (
          <div className="pt-12 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 backdrop-blur-xl text-white font-medium text-xs tracking-wider font-mono transition-all duration-300 hover:border-cyan-400/40 hover:scale-105 active:scale-95 shadow-glass"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                {showAll
                  ? "Show Less Milestones"
                  : `See More Experiences & Credentials (${experience.length - INITIAL_LIMIT} more)`}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-cyan-400 transition-transform duration-300 ${showAll ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Certificate Lightbox Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <div
            data-lenis-prevent="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
              className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#090c13] border border-white/20 p-6 sm:p-8 shadow-glass-elevated flex flex-col text-left overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {selectedCertificate.title}
                    </h3>
                    <span className="text-xs font-mono text-cyan-400">@{selectedCertificate.company}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="h-8 w-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div 
                onContextMenu={(e) => e.preventDefault()}
                className="relative flex-1 min-h-[320px] sm:min-h-[500px] w-full rounded-2xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center p-2 select-none"
              >
                <SmartMedia
                  src={selectedCertificate.url}
                  alt={selectedCertificate.title}
                  fill
                  controls
                  isFullView
                  className="object-contain w-full h-full pointer-events-auto"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Award className="h-4 w-4 text-cyan-400" />
                  <span>Verified Credential Certificate</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="px-6 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-medium text-cyan-300 transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
