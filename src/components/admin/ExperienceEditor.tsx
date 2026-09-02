"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Briefcase, Award, MapPin, Calendar, Layers, FileText, CheckCircle2, Cpu, ArrowUp, ArrowDown } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { ExperienceData } from "@/lib/types";
import MediaUploadInput from "./MediaUploadInput";
import SmartMedia from "../ui/SmartMedia";

interface ExperienceEditorProps {
  experience: ExperienceData[];
  onSaveExperience: (exp: Partial<ExperienceData>) => Promise<void>;
  onDeleteExperience: (id: string) => Promise<void>;
  onReorderExperience?: (exp: ExperienceData[]) => Promise<void>;
}

export default function ExperienceEditor({
  experience,
  onSaveExperience,
  onDeleteExperience,
  onReorderExperience,
}: ExperienceEditorProps) {
  const [editingExp, setEditingExp] = useState<Partial<ExperienceData> | null>(null);
  const [saving, setSaving] = useState(false);

  // Individual Section Visibility Toggles
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [showPeriod, setShowPeriod] = useState<boolean>(true);
  const [showType, setShowType] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(true);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showTechnologies, setShowTechnologies] = useState<boolean>(false);

  const handleCreate = () => {
    setShowLocation(false);
    setShowPeriod(true);
    setShowType(false);
    setShowDescription(true);
    setShowCertificate(false);
    setShowAchievements(false);
    setShowTechnologies(false);

    setEditingExp({
      role: "",
      company: "",
      location: "",
      period: "",
      type: "",
      description: "",
      achievements: [],
      technologies: [],
      order: experience.length + 1,
      certificateUrl: "",
      certificateTitle: "",
    });
  };

  const handleEdit = (exp: ExperienceData) => {
    setShowLocation(Boolean(exp.location && exp.location.trim() !== ""));
    setShowPeriod(Boolean(exp.period && exp.period.trim() !== ""));
    setShowType(Boolean(exp.type && exp.type !== "None" && exp.type.trim() !== ""));
    setShowDescription(Boolean(exp.description && exp.description.trim() !== ""));
    setShowCertificate(Boolean(exp.certificateUrl && exp.certificateUrl.trim() !== ""));
    setShowAchievements(Boolean(exp.achievements && exp.achievements.length > 0));
    setShowTechnologies(Boolean(exp.technologies && exp.technologies.length > 0));

    setEditingExp({ ...exp });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    setSaving(true);

    const cleanedExp: Partial<ExperienceData> = {
      ...editingExp,
      location: showLocation ? editingExp.location || "" : "",
      period: showPeriod ? editingExp.period || "" : "",
      type: showType ? editingExp.type || "" : "",
      description: showDescription ? editingExp.description || "" : "",
      certificateUrl: showCertificate ? editingExp.certificateUrl || null : null,
      certificateTitle: showCertificate ? editingExp.certificateTitle || null : null,
      achievements: showAchievements ? editingExp.achievements || [] : [],
      technologies: showTechnologies ? editingExp.technologies || [] : [],
    };

    try {
      await onSaveExperience(cleanedExp);
      setEditingExp(null);
    } catch {
      alert("Failed to save milestone");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...experience];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    if (onReorderExperience) {
      await onReorderExperience(reordered);
    } else {
      await onSaveExperience({ id: reordered[index - 1].id, order: index });
      await onSaveExperience({ id: reordered[index].id, order: index + 1 });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= experience.length - 1) return;
    const reordered = [...experience];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    if (onReorderExperience) {
      await onReorderExperience(reordered);
    } else {
      await onSaveExperience({ id: reordered[index].id, order: index + 1 });
      await onSaveExperience({ id: reordered[index + 1].id, order: index + 2 });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Experience & Career Milestones</h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Manage your professional journey, shift up/down reorder, verified credentials, and notable achievements.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Milestone</span>
        </button>
      </div>

      {/* Experience Rail List */}
      <div className="space-y-4">
        {experience.map((exp, idx) => (
          <GlassCard
            key={exp.id}
            className="p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              {/* Order Controls */}
              <div className="flex flex-col gap-1 pr-2 border-r border-white/10 self-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="p-1 rounded bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 disabled:opacity-20 transition-all"
                  title="Shift Up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <span className="text-[10px] font-mono text-center text-slate-500">{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === experience.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="p-1 rounded bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 disabled:opacity-20 transition-all"
                  title="Shift Down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              {exp.certificateUrl && (
                <div className="relative h-14 w-20 rounded-lg overflow-hidden border border-cyan-500/30 bg-black/40 flex-shrink-0">
                  <SmartMedia
                    src={exp.certificateUrl}
                    alt={exp.certificateTitle || "Certificate"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-cyan-400">
                    <Award className="h-2.5 w-2.5" />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">{exp.role}</h3>
                  <span className="text-sm text-cyan-400 font-medium">@{exp.company}</span>
                  {exp.period && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-400">
                      {exp.period}
                    </span>
                  )}
                  {exp.type && exp.type !== "None" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {exp.type}
                    </span>
                  )}
                  {exp.location && (
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {exp.location}
                    </span>
                  )}
                  {exp.certificateUrl && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                      <Award className="h-3 w-3 text-cyan-400" />
                      <span>Certificate Attached</span>
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-300 font-light line-clamp-2 mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleEdit(exp)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300 hover:text-white transition-all"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete milestone at ${exp.company}?`)) onDeleteExperience(exp.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-xs text-rose-400 hover:bg-rose-500/20 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Edit / Create Milestone Modal */}
      {editingExp && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto"
        >
          <div
            data-lenis-prevent="true"
            className="w-full max-w-2xl rounded-3xl bg-[#090b10] border border-white/15 p-6 sm:p-8 shadow-glass-elevated max-h-[90vh] overflow-y-auto overscroll-contain text-left"
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  {editingExp.id ? `Edit Milestone: ${editingExp.role}` : "Create Career Milestone"}
                </h3>
              </div>
              <button
                onClick={() => setEditingExp(null)}
                className="h-8 w-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Trash2 className="hidden" />
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Primary Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase text-slate-300">
                    Role Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExp.role || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                    placeholder="e.g. Lead Spatial UI Architect"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase text-slate-300">
                    Company / Organization <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExp.company || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    placeholder="e.g. Acme Innovations"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  />
                </div>
              </div>

              {/* 1. Period / Years Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Period / Duration</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showPeriod}
                      onChange={(e) => setShowPeriod(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showPeriod ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showPeriod && (
                  <input
                    type="text"
                    value={editingExp.period || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })}
                    placeholder="e.g. 2022 — Present or Q3 2024"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                )}
              </div>

              {/* 2. Engagement Type Section with Checkbox & None Option */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Engagement Type</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showType}
                      onChange={(e) => setShowType(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showType ? "Visible" : "Hidden / None"}</span>
                  </label>
                </div>
                {showType && (
                  <select
                    value={editingExp.type || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#090b10] font-mono text-slate-200"
                  >
                    <option value="">None / Do Not Specify</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Education">Education</option>
                    <option value="Internship">Internship</option>
                  </select>
                )}
              </div>

              {/* 3. Location Section with Checkbox (No Auto-Fill) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    <span>Location</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showLocation}
                      onChange={(e) => setShowLocation(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showLocation ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showLocation && (
                  <input
                    type="text"
                    value={editingExp.location || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, location: e.target.value })}
                    placeholder="e.g. Tokyo / Remote / Hybrid"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                )}
              </div>

              {/* 4. Description / Overview Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Role Description</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showDescription}
                      onChange={(e) => setShowDescription(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showDescription ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showDescription && (
                  <textarea
                    rows={2}
                    value={editingExp.description || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                    placeholder="Overview of responsibilities, mission, and scope..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                )}
              </div>

              {/* 5. Certificate & Credential Media Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-cyan-300 font-semibold flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Certificate & Credential Media (Image/PDF)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showCertificate}
                      onChange={(e) => setShowCertificate(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showCertificate ? "Visible" : "Hidden"}</span>
                  </label>
                </div>

                {showCertificate && (
                  <div className="space-y-3 pt-1">
                    <MediaUploadInput
                      label="Certificate Media (PDF, JPG, PNG)"
                      value={editingExp.certificateUrl || ""}
                      onChange={(url) => setEditingExp({ ...editingExp, certificateUrl: url })}
                      category="certificates"
                      helperText="Supports PDF certificates or certificate photos"
                    />

                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Certificate Title / Badge Label
                      </label>
                      <input
                        type="text"
                        value={editingExp.certificateTitle || ""}
                        onChange={(e) =>
                          setEditingExp({ ...editingExp, certificateTitle: e.target.value })
                        }
                        placeholder="e.g. Certified Spatial Systems Architect • Verified Credential"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Key Achievements Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Key Achievements</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showAchievements}
                      onChange={(e) => setShowAchievements(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showAchievements ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showAchievements && (
                  <textarea
                    rows={3}
                    value={editingExp.achievements?.join("\n") || ""}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        achievements: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                    placeholder="Enter achievements one per line&#10;e.g. Spearheaded micro-frontend migration&#10;e.g. Scaled real-time WebSocket infrastructure"
                  />
                )}
              </div>

              {/* 7. Technologies Utilized Section with Checkbox */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Technologies Utilized</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={showTechnologies}
                      onChange={(e) => setShowTechnologies(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
                    />
                    <span>{showTechnologies ? "Visible" : "Hidden"}</span>
                  </label>
                </div>
                {showTechnologies && (
                  <input
                    type="text"
                    value={editingExp.technologies?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        technologies: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g. Three.js, WebGL, Next.js, Python"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 shadow-sm"
                >
                  {saving ? "Saving..." : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
