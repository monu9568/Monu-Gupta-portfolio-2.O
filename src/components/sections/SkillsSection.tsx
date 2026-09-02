"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Box, Atom, Code, Zap, Server, Database, Cpu, Sparkles, Eye, Palette, CheckCircle2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { SkillData } from "@/lib/types";

interface SkillsSectionProps {
  skills: SkillData[];
}

const iconMap: Record<string, any> = {
  Box,
  Atom,
  Code,
  Zap,
  Server,
  Database,
  Cpu,
  Sparkles,
  Eye,
  Palette,
};

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Frontend & 3D", "Backend & Cloud", "AI & Data", "Spatial & Design"];

  const filteredSkills = activeCategory === "All"
    ? skills
    : skills.filter((s) => s.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <section id="skills" className="relative py-28 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Background Refraction Glow */}
      <div className="liquid-glow-1 top-1/2 right-1/4 h-[500px] w-[500px] opacity-15" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-400 mb-4">
              <Terminal className="h-3.5 w-3.5" />
              <span>SKILLS & TECHNOLOGIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Technical <span className="text-gradient-cyan">Skills</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl font-light">
              A modern technology stack for building scalable web applications, AI projects, and interactive user experiences.            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${activeCategory === cat
                    ? "bg-white/[0.12] text-white shadow-glow-accent border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Glass Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, idx) => {
            const IconComponent = (skill.icon && iconMap[skill.icon]) ? iconMap[skill.icon] : Sparkles;
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard
                  elevated={skill.highlight}
                  className="p-6 h-full flex flex-col justify-between border border-white/10 hover:border-cyan-400/30 hover:shadow-glow-accent transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.06] border border-white/15 text-cyan-400">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white tracking-tight">
                            {skill.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">
                            {skill.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {skill.level}%
                      </span>
                    </div>

                    {skill.description && (
                      <p className="text-slate-300 text-xs leading-relaxed font-light mb-4">
                        {skill.description}
                      </p>
                    )}
                  </div>

                  {/* Glass Liquid Level Indicator Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 rounded-full"
                    />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
