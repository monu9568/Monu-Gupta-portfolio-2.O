import React from "react";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/sections/Footer";
import ContentShield from "@/components/security/ContentShield";
import { getPortfolioData } from "@/lib/db";

// Revalidate data on Edge CDN for instant 15ms global loading
export const revalidate = 60;



export default function HomePage() {
  const data = getPortfolioData();

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
