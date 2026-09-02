"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Film,
  Layers,
  Code2,
  Activity,
  Cpu,
  Link as LinkIcon,
  Tag,
  Globe,
  Github,
  CheckCircle2,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { ProjectData } from "@/lib/types";
import Image from "next/image";
import MediaUploadInput from "./MediaUploadInput";

interface ProjectsEditorProps {
  projects: ProjectData[];
  onSaveProject: (project: Partial<ProjectData>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onReorderProjects?: (projects: ProjectData[]) => Promise<void>;
}

export default function ProjectsEditor({
  projects,
  onSaveProject,
  onDeleteProject,
  onReorderProjects,
}: ProjectsEditorProps) {
  const [editingProject, setEditingProject] = useState<Partial<ProjectData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Individual Section Visibility Toggles
  const [showSlug, setShowSlug] = useState<boolean>(true);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(true);
  const [showCategory, setShowCategory] = useState<boolean>(true);
  const [showStatus, setShowStatus] = useState<boolean>(true);
  const [showTechStack, setShowTechStack] = useState<boolean>(true);
  const [showLiveUrl, setShowLiveUrl] = useState<boolean>(true);
  const [showGithubUrl, setShowGithubUrl] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [showGallery, setShowGallery] = useState<boolean>(true);
  const [showProblem, setShowProblem] = useState<boolean>(true);
  const [showSolution, setShowSolution] = useState<boolean>(true);
  const [showArchitecture, setShowArchitecture] = useState<boolean>(true);
  const [showImpact, setShowImpact] = useState<boolean>(true);
  const [showPerformance, setShowPerformance] = useState<boolean>(true);

  // Collect all known categories
  const defaultCategories = ["Spatial UI", "3D / WebGL", "AI / Data", "Full Stack"];
  const existingCategories = Array.from(
    new Set([...defaultCategories, ...projects.map((p) => p.category).filter(Boolean)])
  );

  const handleCreateNew = () => {
    setIsCustomCategory(false);
    setCustomCategoryInput("");

    setShowSlug(false);
    setShowSubtitle(true);
    setShowCategory(true);
    setShowStatus(true);
    setShowTechStack(true);
    setShowLiveUrl(false);
    setShowGithubUrl(false);
    setShowVideo(false);
    setShowGallery(false);
    setShowProblem(false);
    setShowSolution(false);
    setShowArchitecture(false);
    setShowImpact(false);
    setShowPerformance(false);

    setEditingProject({
      title: "",
      slug: "",
      subtitle: "",
      category: "Spatial UI",
      status: "Production",
      featured: true,
      order: projects.length + 1,
      thumbnail: "/images/projects/spatial-vision-os.jpg",
      gallery: ["/images/projects/spatial-vision-os.jpg"],
      techStack: ["Next.js", "Three.js", "TypeScript"],
      hasCaseStudy: false,
      problem: "",
      solution: "",
      architecture: "",
      impact: "",
      performance: "",
      liveUrl: "",
      githubUrl: "",
      videoUrl: "",
    });
  };

  const handleEdit = (project: ProjectData) => {
    const isCustom = !defaultCategories.includes(project.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? project.category : "");

    setShowSlug(Boolean(project.slug));
    setShowSubtitle(Boolean(project.subtitle));
    setShowCategory(project.showCategory !== false);
    setShowStatus(project.showStatus !== false);
    setShowTechStack(Boolean(project.techStack && project.techStack.length > 0));
    setShowLiveUrl(Boolean(project.liveUrl));
    setShowGithubUrl(Boolean(project.githubUrl));
    setShowVideo(Boolean(project.videoUrl));
    setShowGallery(Boolean(project.gallery && project.gallery.length > 0));
    setShowProblem(Boolean(project.problem));
    setShowSolution(Boolean(project.solution));
    setShowArchitecture(Boolean(project.architecture));
    setShowImpact(Boolean(project.impact));
    setShowPerformance(Boolean(project.performance));

    setEditingProject({
      ...project,
      hasCaseStudy:
        project.hasCaseStudy !== undefined
          ? project.hasCaseStudy
          : Boolean(project.problem || project.solution || project.architecture || project.impact),
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || editingProject.category || "General"
      : editingProject.category || "Spatial UI";

    const cleanedProject: Partial<ProjectData> = {
      ...editingProject,
      category: finalCategory,
      slug: showSlug ? editingProject.slug || "" : "",
      subtitle: showSubtitle ? editingProject.subtitle || "" : "",
      techStack: showTechStack ? editingProject.techStack || [] : [],
      liveUrl: showLiveUrl ? editingProject.liveUrl || null : null,
      githubUrl: showGithubUrl ? editingProject.githubUrl || null : null,
      videoUrl: showVideo ? editingProject.videoUrl || null : null,
      gallery: showGallery ? editingProject.gallery || [] : [],
      problem: showProblem ? editingProject.problem || "" : "",
      solution: showSolution ? editingProject.solution || "" : "",
      architecture: showArchitecture ? editingProject.architecture || "" : "",
      impact: showImpact ? editingProject.impact || "" : "",
      performance: showPerformance ? editingProject.performance || "" : "",
      hasCaseStudy: Boolean(
        (showProblem && editingProject.problem) ||
          (showSolution && editingProject.solution) ||
          (showArchitecture && editingProject.architecture) ||
          (showImpact && editingProject.impact)
      ),
    };

    try {
      await onSaveProject(cleanedProject);
      setEditingProject(null);
    } catch (err) {
      alert("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    if (onReorderProjects) {
      await onReorderProjects(reordered);
    } else {
      // Fallback update orders
      await onSaveProject({ id: reordered[index - 1].id, order: index });
      await onSaveProject({ id: reordered[index].id, order: index + 1 });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= projects.length - 1) return;
    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    if (onReorderProjects) {
      await onReorderProjects(reordered);
    } else {
      // Fallback update orders
      await onSaveProject({ id: reordered[index].id, order: index + 1 });
      await onSaveProject({ id: reordered[index + 1].id, order: index + 2 });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      await onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Project Management & Case Studies
          </h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Create, refine, shift up/down reorder, and toggle specific case study sections for flagship portfolio experiences.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects List Grid with Reorder Arrows */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, idx) => (
          <GlassCard
            key={project.id}
            className="p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {/* Order Controls */}
              <div className="flex flex-col gap-1 pr-1 border-r border-white/10">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="p-1 rounded bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                  title="Shift Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono text-center text-slate-500">{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === projects.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="p-1 rounded bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                  title="Shift Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-white/15 bg-black/40 flex-shrink-0">
                {project.thumbnail?.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    src={project.thumbnail}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={project.thumbnail || "/images/projects/spatial-vision-os.jpg"}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {project.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    {project.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">
                    {project.status}
                  </span>
                </div>
                {project.subtitle && (
                  <p className="text-xs text-slate-400 font-light line-clamp-1 mt-1">
                    {project.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.techStack?.slice(0, 4).map((t, i) => (
                    <span key={i} className="text-[10px] font-mono text-slate-500">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
              <button
                onClick={() => handleEdit(project)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(project.id, project.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-400 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingProject && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-xl"
        >
          <div
            data-lenis-prevent="true"
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#090b10] border border-white/15 p-6 sm:p-8 text-left shadow-glass-elevated"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingProject.id
                  ? `Edit Project: ${editingProject.title}`
                  : "Create New Project"}
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Project Title (Core Identifier) */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Project Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="e.g. Aura VisionOS Spatial Workspace"
                />
              </div>

              {/* Slug Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Project Slug (URL identifier)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showSlug}
                      onChange={(e) => setShowSlug(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showSlug ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showSlug && (
                  <input
                    type="text"
                    value={editingProject.slug || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    placeholder="aura-visionos"
                  />
                )}
              </div>

              {/* Category Section with Custom Category Creation + Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Category Selection & Custom Categories</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showCategory}
                      onChange={(e) => setShowCategory(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showCategory ? "Visible" : "Hidden"}</span>
                  </label>
                </div>

                {showCategory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Choose Existing Category or Create New
                      </label>
                      <select
                        value={isCustomCategory ? "__custom__" : editingProject.category || "Spatial UI"}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsCustomCategory(true);
                          } else {
                            setIsCustomCategory(false);
                            setEditingProject({ ...editingProject, category: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#090b10]"
                      >
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__custom__">+ Add Custom Category...</option>
                      </select>
                    </div>

                    {isCustomCategory && (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-cyan-400 font-semibold">
                          Custom Category Name
                        </label>
                        <input
                          type="text"
                          required
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          placeholder="e.g. Mobile App, WebXR, Robotics..."
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs border-cyan-500/40"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Project Lifecycle Status</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showStatus}
                      onChange={(e) => setShowStatus(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showStatus ? "Visible" : "Hidden"}</span>
                  </label>
                </div>

                {showStatus && (
                  <select
                    value={editingProject.status || "Production"}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#090b10]"
                  >
                    <option value="Production">Production</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Experimental">Experimental</option>
                    <option value="Concept">Concept</option>
                  </select>
                )}
              </div>

              {/* Subtitle / Tagline with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold">
                    Subtitle / Tagline
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showSubtitle}
                      onChange={(e) => setShowSubtitle(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showSubtitle ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showSubtitle && (
                  <input
                    type="text"
                    value={editingProject.subtitle || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, subtitle: e.target.value })
                    }
                    placeholder="Short engaging summary of the project..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                )}
              </div>

              {/* Primary Thumbnail */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <MediaUploadInput
                  label="Project Primary Thumbnail (Image or Video)"
                  value={editingProject.thumbnail || ""}
                  onChange={(url) =>
                    setEditingProject({ ...editingProject, thumbnail: url })
                  }
                  category="projects"
                  helperText="Supports PNG, JPG, WebP, SVG, MP4, WebM"
                />
              </div>

              {/* Video Demonstration Section with Checkbox */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-mono uppercase text-slate-300 font-semibold">
                      Video Demonstration / Motion Reel
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showVideo}
                      onChange={(e) => setShowVideo(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showVideo ? "Visible" : "Hidden"}</span>
                  </label>
                </div>

                {showVideo && (
                  <MediaUploadInput
                    label="Video Demonstration URL or File"
                    value={editingProject.videoUrl || ""}
                    onChange={(url) =>
                      setEditingProject({ ...editingProject, videoUrl: url })
                    }
                    category="video"
                    helperText="Upload .mp4 / .webm video for the interactive live showcase"
                  />
                )}
              </div>

              {/* Multi-Media Showcase Gallery Section with Checkbox */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                        Multi-Media Showcase Gallery
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Additional screenshots, diagrams, or video clips
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showGallery}
                        onChange={(e) => setShowGallery(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                      />
                      <span>{showGallery ? "Visible" : "Hidden"}</span>
                    </label>

                    {showGallery && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentGallery = editingProject.gallery || [];
                          setEditingProject({
                            ...editingProject,
                            gallery: [...currentGallery, ""],
                          });
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Item</span>
                      </button>
                    )}
                  </div>
                </div>

                {showGallery && (
                  <div className="space-y-3 pt-2">
                    {(editingProject.gallery || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <MediaUploadInput
                            label={`Gallery Item #${idx + 1}`}
                            value={item}
                            onChange={(url) => {
                              const newGallery = [...(editingProject.gallery || [])];
                              newGallery[idx] = url;
                              setEditingProject({
                                ...editingProject,
                                gallery: newGallery,
                              });
                            }}
                            category="projects"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newGallery = (editingProject.gallery || []).filter(
                              (_, i) => i !== idx
                            );
                            setEditingProject({
                              ...editingProject,
                              gallery: newGallery,
                            });
                          }}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 self-center"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tech Stack Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Tech Stack (Comma Separated)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showTechStack}
                      onChange={(e) => setShowTechStack(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showTechStack ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showTechStack && (
                  <input
                    type="text"
                    value={editingProject.techStack?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        techStack: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    placeholder="Next.js, Three.js, TypeScript"
                  />
                )}
              </div>

              {/* Live Demo & GitHub URLs with Individual Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Live Demo URL */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Live Demo URL</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showLiveUrl}
                        onChange={(e) => setShowLiveUrl(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3 w-3"
                      />
                      <span>{showLiveUrl ? "Visible" : "Hidden"}</span>
                    </label>
                  </div>
                  {showLiveUrl && (
                    <input
                      type="url"
                      value={editingProject.liveUrl || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, liveUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="https://..."
                    />
                  )}
                </div>

                {/* GitHub URL */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-slate-300" />
                      <span>GitHub URL</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showGithubUrl}
                        onChange={(e) => setShowGithubUrl(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3 w-3"
                      />
                      <span>{showGithubUrl ? "Visible" : "Hidden"}</span>
                    </label>
                  </div>
                  {showGithubUrl && (
                    <input
                      type="url"
                      value={editingProject.githubUrl || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, githubUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      placeholder="https://github.com/..."
                    />
                  )}
                </div>
              </div>

              {/* Case Study Section Fields with SEPARATE Checkbox for EACH item */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Case Study Content Breakdown
                  </h4>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">
                    Toggle checkboxes below to individually show or hide each specific case study section.
                  </p>
                </div>

                {/* 1. Problem & Challenge */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold">
                      Problem & Challenge
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showProblem}
                        onChange={(e) => setShowProblem(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                      />
                      <span>{showProblem ? "Visible (Checked)" : "Hidden (Unchecked)"}</span>
                    </label>
                  </div>

                  {showProblem && (
                    <textarea
                      rows={2}
                      value={editingProject.problem || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, problem: e.target.value })
                      }
                      placeholder="Describe the problem, challenge, or background..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                    />
                  )}
                </div>

                {/* 2. Solution & Innovation */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold">
                      Solution & Innovation
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showSolution}
                        onChange={(e) => setShowSolution(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                      />
                      <span>{showSolution ? "Visible (Checked)" : "Hidden (Unchecked)"}</span>
                    </label>
                  </div>

                  {showSolution && (
                    <textarea
                      rows={2}
                      value={editingProject.solution || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, solution: e.target.value })
                      }
                      placeholder="Describe the engineered solution and creative innovations..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                    />
                  )}
                </div>

                {/* 3. Architecture Details */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold">
                      Architecture Details
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showArchitecture}
                        onChange={(e) => setShowArchitecture(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                      />
                      <span>{showArchitecture ? "Visible (Checked)" : "Hidden (Unchecked)"}</span>
                    </label>
                  </div>

                  {showArchitecture && (
                    <textarea
                      rows={2}
                      value={editingProject.architecture || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          architecture: e.target.value,
                        })
                      }
                      placeholder="Technical stack, shader pipelines, data models, or system architecture..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                    />
                  )}
                </div>

                {/* 4. Performance & Impact */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold">
                      Performance & Impact
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showImpact}
                        onChange={(e) => setShowImpact(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                      />
                      <span>{showImpact ? "Visible (Checked)" : "Hidden (Unchecked)"}</span>
                    </label>
                  </div>

                  {showImpact && (
                    <textarea
                      rows={2}
                      value={editingProject.impact || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, impact: e.target.value })
                      }
                      placeholder="Measured user growth, performance improvements, or impact..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                    />
                  )}
                </div>

                {/* 5. Performance Benchmark Badge */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-slate-300 font-semibold">
                      Performance Benchmark Badge
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={showPerformance}
                        onChange={(e) => setShowPerformance(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                      />
                      <span>{showPerformance ? "Visible (Checked)" : "Hidden (Unchecked)"}</span>
                    </label>
                  </div>

                  {showPerformance && (
                    <input
                      type="text"
                      value={editingProject.performance || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          performance: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                      placeholder="120 FPS Native • 4.2MB Bundle"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105"
                >
                  {saving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
