"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Terminal,
  Briefcase,
  User,
  Mail,
  Folder,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Compass,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import AdminLogin from "@/components/admin/AdminLogin";
import HeroEditor from "@/components/admin/HeroEditor";
import NavFooterEditor from "@/components/admin/NavFooterEditor";
import ProjectsEditor from "@/components/admin/ProjectsEditor";
import SkillsEditor from "@/components/admin/SkillsEditor";
import ExperienceEditor from "@/components/admin/ExperienceEditor";
import AboutEditor from "@/components/admin/AboutEditor";
import ContactEditor from "@/components/admin/ContactEditor";
import MediaLibrary from "@/components/admin/MediaLibrary";
import InquiriesViewer from "@/components/admin/InquiriesViewer";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { FullPortfolioData, HeroData, ProjectData, SkillData, ExperienceData, AboutData, SiteSettingsData } from "@/lib/types";

type AdminTab =
  | "overview"
  | "hero"
  | "navfooter"
  | "projects"
  | "skills"
  | "experience"
  | "about"
  | "contact"
  | "media"
  | "messages"
  | "settings";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>("admin");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [data, setData] = useState<FullPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check secret access key & verify session on mount
  useEffect(() => {
    let unlocked = false;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const access = urlParams.get("access");
      if (access === "mg_studio") {
        unlocked = true;
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    }

    const checkAuth = async () => {
      try {
        if (unlocked) {
          const [authRes, dataRes] = await Promise.all([
            fetch("/api/auth"),
            fetch("/api/portfolio")
          ]);
          const authJson = await authRes.json();
          if (authJson.authenticated) {
            setIsAuthenticated(true);
            setUsername(authJson.username || "admin");
            const dataJson = await dataRes.json();
            setData(dataJson);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          const res = await fetch("/api/auth");
          const json = await res.json();
          setIsAuthenticated(json.authenticated);
          if (json.authenticated) setUsername(json.username || "admin");
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load portfolio data in CMS", err);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("cms_portal_unlocked");
    }
    setIsUnlocked(false);
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setIsAuthenticated(false);
  };

  const handleSaveHero = async (updated: Partial<HeroData>) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "hero", data: updated }),
    });
    if (!res.ok) throw new Error("Failed to save hero");
    await fetchPortfolioData();
  };

  const handleSaveAbout = async (updated: Partial<AboutData>) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "about", data: updated }),
    });
    if (!res.ok) throw new Error("Failed to save about");
    await fetchPortfolioData();
  };

  const handleSaveSettings = async (updated: Partial<SiteSettingsData>) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "settings", data: updated }),
    });
    if (!res.ok) throw new Error("Failed to save settings");
    await fetchPortfolioData();
  };

  const handleSaveProject = async (proj: Partial<ProjectData>) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proj),
    });
    if (!res.ok) throw new Error("Failed to save project");
    await fetchPortfolioData();
  };

  const handleDeleteProject = async (id: string) => {
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete project");
    await fetchPortfolioData();
  };

  const handleReorderProjects = async (projects: ProjectData[]) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "reorder_projects", data: projects }),
    });
    if (!res.ok) throw new Error("Failed to reorder projects");
    await fetchPortfolioData();
  };

  const handleSaveSkill = async (skill: Partial<SkillData>) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "skill", data: skill }),
    });
    if (!res.ok) throw new Error("Failed to save skill");
    await fetchPortfolioData();
  };

  const handleDeleteSkill = async (id: string) => {
    const res = await fetch(`/api/portfolio?type=skill&id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete skill");
    await fetchPortfolioData();
  };

  const handleReorderSkills = async (skills: SkillData[]) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "reorder_skills", data: skills }),
    });
    if (!res.ok) throw new Error("Failed to reorder skills");
    await fetchPortfolioData();
  };

  const handleSaveExperience = async (exp: Partial<ExperienceData>) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "experience", data: exp }),
    });
    if (!res.ok) throw new Error("Failed to save experience");
    await fetchPortfolioData();
  };

  const handleDeleteExperience = async (id: string) => {
    const res = await fetch(`/api/portfolio?type=experience&id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete experience");
    await fetchPortfolioData();
  };

  const handleReorderExperience = async (exp: ExperienceData[]) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "reorder_experience", data: exp }),
    });
    if (!res.ok) throw new Error("Failed to reorder experience");
    await fetchPortfolioData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
          <span className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING CMS ENGINE...</span>
        </div>
      </div>
    );
  }

  // 1. If someone accesses /admin directly without the secret access key, ALWAYS show 404
  if (isUnlocked === false) {
    return (
      <div className="min-h-screen bg-[#06070a] flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="h-16 w-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-glass">
          <span className="font-mono text-xl font-bold">404</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6 font-light">
          The requested resource could not be found or is not accessible.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white text-xs font-mono transition-all"
        >
          Return to Portfolio
        </Link>
      </div>
    );
  }

  // 2. If unlocked via secret gesture but not logged in, show Admin Login form
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setUsername(user);
          fetchPortfolioData();
        }}
      />
    );
  }

  if (!data) return null;

  const navItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "hero", label: "Hero & 3D Cube", icon: Sparkles },
    { id: "navfooter", label: "Navbar & Footer", icon: Compass },
    { id: "projects", label: "Projects & Cases", icon: Layers },
    { id: "skills", label: "Skills Ecosystem", icon: Terminal },
    { id: "experience", label: "Experience Rail", icon: Briefcase },
    { id: "about", label: "My Journey", icon: User },
    { id: "contact", label: "Contact & Enquiry", icon: MessageSquare },
    { id: "media", label: "Media Library", icon: Folder },
    { id: "messages", label: "Inquiries Hub", icon: Mail },
    { id: "settings", label: "SEO & Database", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#090b10]/90 backdrop-blur-2xl p-4 md:p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                MG
              </div>
              <div>
                <span className="font-bold text-sm text-white tracking-tight block">Spatial CMS</span>
                <span className="text-[10px] font-mono text-slate-500 block">v2.0 • Pro Suite</span>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white"
              title="Open Live Portfolio"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/[0.1] text-white border border-white/15 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Session Footer */}
        <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400 truncate max-w-[100px]">{username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            title="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main data-lenis-prevent="true" className="flex-1 p-6 sm:p-8 md:p-12 overflow-y-auto max-h-screen overscroll-contain">
        <div className="max-w-5xl mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Operations Dashboard</h1>
                  <p className="text-xs text-slate-400 font-light mt-0.5">
                    Real-time status overview of content modules, 3D assets, and incoming messages.
                  </p>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105"
                >
                  <span>Launch Live Portfolio</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Metric Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <GlassCard className="p-5 border border-white/10">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Flagship Works</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">{data.projects.length}</span>
                  <span className="text-[10px] text-cyan-400 mt-1 block">Active Showcases</span>
                </GlassCard>

                <GlassCard className="p-5 border border-white/10">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Tech Skills</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">{data.skills.length}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Ecosystem Nodes</span>
                </GlassCard>

                <GlassCard className="p-5 border border-white/10">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Milestones</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">{data.experience.length}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Verified Career Nodes</span>
                </GlassCard>

                <GlassCard className="p-5 border border-white/10">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Engine Health</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">100%</span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">WebGL & R3F Active</span>
                </GlassCard>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <GlassCard className="p-6 border border-white/10 space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Hero & 3D Cube Quick Preview</span>
                  </h3>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                    <div className="text-slate-400">Owner: <span className="text-white font-medium">{data.hero.name}</span></div>
                    <div className="text-slate-400">Title: <span className="text-white font-medium">{data.hero.title}</span></div>
                    <div className="text-slate-400 truncate">Tagline: <span className="text-white">{data.hero.tagline}</span></div>
                  </div>
                  <button
                    onClick={() => setActiveTab("hero")}
                    className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Edit Hero & 3D Textures</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </GlassCard>

                <GlassCard className="p-6 border border-white/10 space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-400" />
                    <span>Client Inquiries Gateway</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-light">
                    Direct communications sent by clients through the encrypted contact form are logged and managed in real time.
                  </p>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Messages Inbox</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === "hero" && (
            <HeroEditor hero={data.hero} onSave={handleSaveHero} />
          )}

          {activeTab === "navfooter" && (
            <NavFooterEditor settings={data.settings} onSave={handleSaveSettings} />
          )}

          {activeTab === "projects" && (
            <ProjectsEditor
              projects={data.projects}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onReorderProjects={handleReorderProjects}
            />
          )}

          {activeTab === "skills" && (
            <SkillsEditor
              skills={data.skills}
              onSaveSkill={handleSaveSkill}
              onDeleteSkill={handleDeleteSkill}
              onReorderSkills={handleReorderSkills}
            />
          )}

          {activeTab === "experience" && (
            <ExperienceEditor
              experience={data.experience}
              onSaveExperience={handleSaveExperience}
              onDeleteExperience={handleDeleteExperience}
              onReorderExperience={handleReorderExperience}
            />
          )}

          {activeTab === "about" && (
            <AboutEditor about={data.about} onSave={handleSaveAbout} />
          )}

          {activeTab === "contact" && (
            <ContactEditor hero={data.hero} onSave={handleSaveHero} />
          )}

          {activeTab === "media" && (
            <MediaLibrary />
          )}

          {activeTab === "messages" && (
            <InquiriesViewer />
          )}

          {activeTab === "settings" && (
            <SettingsEditor
              settings={data.settings}
              onSaveSettings={handleSaveSettings}
              onRefreshData={fetchPortfolioData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
