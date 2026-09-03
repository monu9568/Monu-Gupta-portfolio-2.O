"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/sections/Footer";
import ContentShield from "@/components/security/ContentShield";
import { FullPortfolioData } from "@/lib/types";

interface PortfolioViewProps {
  initialData: FullPortfolioData;
}

export default function PortfolioView({ initialData }: PortfolioViewProps) {
  const [data, setData] = useState<FullPortfolioData>(initialData);

  useEffect(() => {
    setData(initialData);

    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/portfolio?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const fresh = await res.json();
          if (fresh && fresh.hero) {
            setData(fresh);
          }
        }
      } catch (err) {
        // Silently preserve current state
      }
    };

    fetchLatest();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", fetchLatest);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("portfolio_cms_updates");
        channel.onmessage = () => {
          fetchLatest();
        };
      }
    } catch {}

    const interval = setInterval(fetchLatest, 4000);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", fetchLatest);
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [initialData]);

  return (
    <main className="relative min-h-screen bg-[#06070a] text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      {/* Anti-Theft Content & Screenshot Protection Shield */}
      <ContentShield settings={data.settings} />

      {/* VisionOS Floating Island Navigation */}
      <Navbar settings={data.settings} />

      {/* Hero Section & 3D Personal Identity Cube */}
      <HeroSection hero={data.hero} />

      {/* Flagship Projects & Interactive Case Studies */}
      <ProjectsSection projects={data.projects} />

      {/* Technical Skills Ecosystem */}
      <SkillsSection skills={data.skills} />

      {/* Chronological Milestone Timeline */}
      <ExperienceSection experience={data.experience} />

      {/* Origin, Philosophy & Studio Environment */}
      <AboutSection about={data.about} avatarImg={data.about.photoUrl || data.hero.avatarUrl} />

      {/* Luxury Encrypted Contact Inquiries */}
      <ContactSection hero={data.hero} />

      {/* Telemetry & Minimalist Footer */}
      <Footer settings={data.settings} />
    </main>
  );
}
