import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ContentShield from "@/components/security/ContentShield";
import { getPortfolioData } from "@/lib/db";


// Progressive below-the-fold dynamic imports
const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection"));
const SkillsSection = dynamic(() => import("@/components/sections/SkillsSection"));
const ExperienceSection = dynamic(() => import("@/components/sections/ExperienceSection"));
const AboutSection = dynamic(() => import("@/components/sections/AboutSection"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));
const Footer = dynamic(() => import("@/components/sections/Footer"));

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
