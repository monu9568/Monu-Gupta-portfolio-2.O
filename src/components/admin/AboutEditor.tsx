"use client";

import React, { useState } from "react";
import {
  Save,
  Check,
  User,
  Sparkles,
  Plus,
  Trash2,
  Monitor,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Tag,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { AboutData } from "@/lib/types";
import MediaUploadInput from "./MediaUploadInput";

interface AboutEditorProps {
  about: AboutData;
  onSave: (updated: Partial<AboutData>) => Promise<void>;
}

export default function AboutEditor({ about, onSave }: AboutEditorProps) {
  const [formData, setFormData] = useState<AboutData>({
    ...about,
    badge: about.badge || "ORIGIN & PHILOSOPHY",
    titlePrefix: about.titlePrefix || "My",
    titleGradient: about.titleGradient || "Journey",
    subtitle:
      about.subtitle ||
      "A relentless pursuit of technical excellence, spatial aesthetics, and physical digital craftsmanship.",
    storyTitle: about.storyTitle || "Code as a Sculptural Medium",
    showStoryTitle: about.showStoryTitle !== false,
    showStoryParagraph1: about.showStoryParagraph1 !== false,
    showStoryParagraph2: about.showStoryParagraph2 !== false,
    additionalParagraphs: about.additionalParagraphs || [],
    showHardwareSpecs: about.showHardwareSpecs !== false,
    hardwareTitle: about.hardwareTitle || "Studio Environment & Instruments",
    hardwareSpecs: about.hardwareSpecs || [
      { label: "Primary Rig", value: "Apple Silicon M3 Max (128GB Unified Memory)" },
      { label: "Display", value: "Apple Pro Display XDR 32-inch 6K Retinal" },
      { label: "Spatial Device", value: "Apple Vision Pro 512GB (visionOS 2.0)" },
      { label: "Creative Stack", value: "VS Code, Three.js, Blender, Figma, Warp Terminal" },
    ],
    showPhotoCard: about.showPhotoCard !== false,
    photoUrl: about.photoUrl || "",
    photoOverlayTag: about.photoOverlayTag || "Spatial Technologist",
    photoOverlayName: about.photoOverlayName || "Monu Gupta",
    showPhilosophy: about.showPhilosophy !== false,
    philosophyTitle: about.philosophyTitle || "Core Principles",
    philosophyText: about.philosophyText || "",
    coreValues: about.coreValues || [],
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Failed to save about section");
    } finally {
      setSaving(false);
    }
  };

  // Pillar handlers
  const handleAddPillar = () => {
    setFormData({
      ...formData,
      coreValues: [
        ...formData.coreValues,
        { title: "New Principle", desc: "Principle description.", visible: true },
      ],
    });
  };

  const handleRemovePillar = (idx: number) => {
    setFormData({
      ...formData,
      coreValues: formData.coreValues.filter((_, i) => i !== idx),
    });
  };

  const handleMovePillarUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...formData.coreValues];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setFormData({ ...formData, coreValues: updated });
  };

  const handleMovePillarDown = (idx: number) => {
    if (idx >= formData.coreValues.length - 1) return;
    const updated = [...formData.coreValues];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setFormData({ ...formData, coreValues: updated });
  };

  // Hardware spec handlers
  const handleAddSpec = () => {
    setFormData({
      ...formData,
      hardwareSpecs: [
        ...formData.hardwareSpecs,
        { label: "Hardware / Tool", value: "Specification" },
      ],
    });
  };

  const handleRemoveSpec = (idx: number) => {
    setFormData({
      ...formData,
      hardwareSpecs: formData.hardwareSpecs.filter((_, i) => i !== idx),
    });
  };

  // Additional paragraphs handlers
  const handleAddParagraph = () => {
    setFormData({
      ...formData,
      additionalParagraphs: [...(formData.additionalParagraphs || []), ""],
    });
  };

  const handleRemoveParagraph = (idx: number) => {
    setFormData({
      ...formData,
      additionalParagraphs: (formData.additionalParagraphs || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            About Narrative, Philosophy & Pillars Studio
          </h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Customize section headings, narrative story cards, studio hardware specs, and philosophy pillars.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
        >
          {savedSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-950" />
              <span>Saved Successfully</span>
            </>
          ) : saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save About Section</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Main Section Heading & Subtitle */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>Section Header & Main Titles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Badge / Pill Tag</label>
            <input
              type="text"
              value={formData.badge || ""}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              placeholder="ORIGIN & PHILOSOPHY"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Title Prefix</label>
            <input
              type="text"
              value={formData.titlePrefix || ""}
              onChange={(e) => setFormData({ ...formData, titlePrefix: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white font-bold"
              placeholder="My"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-cyan-400">Title Gradient Word</label>
            <input
              type="text"
              value={formData.titleGradient || ""}
              onChange={(e) => setFormData({ ...formData, titleGradient: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-cyan-300 font-bold"
              placeholder="Journey"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono text-slate-300">Section Subtitle / Description</label>
          <input
            type="text"
            value={formData.subtitle || ""}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200"
            placeholder="A relentless pursuit of technical excellence..."
          />
        </div>
      </GlassCard>

      {/* 2. Narrative Story Card */}
      <GlassCard className="p-6 space-y-5 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Narrative Story Card
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddParagraph}
            className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
          >
            <Plus className="h-3 w-3" />
            <span>Add Paragraph</span>
          </button>
        </div>

        {/* Story Card Title */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono text-slate-300">Story Card Title</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-400 hover:text-white">
              <input
                type="checkbox"
                checked={formData.showStoryTitle !== false}
                onChange={(e) => setFormData({ ...formData, showStoryTitle: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
              />
              <span>{formData.showStoryTitle !== false ? "Visible" : "Hidden"}</span>
            </label>
          </div>
          {formData.showStoryTitle !== false && (
            <input
              type="text"
              value={formData.storyTitle || ""}
              onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white font-semibold"
              placeholder="Code as a Sculptural Medium"
            />
          )}
        </div>

        {/* Paragraph 1 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono text-slate-300">Paragraph 1 (Origin & Vision)</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-400 hover:text-white">
              <input
                type="checkbox"
                checked={formData.showStoryParagraph1 !== false}
                onChange={(e) => setFormData({ ...formData, showStoryParagraph1: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
              />
              <span>{formData.showStoryParagraph1 !== false ? "Visible" : "Hidden"}</span>
            </label>
          </div>
          {formData.showStoryParagraph1 !== false && (
            <textarea
              rows={3}
              value={formData.storyParagraph1 || ""}
              onChange={(e) => setFormData({ ...formData, storyParagraph1: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none leading-relaxed"
            />
          )}
        </div>

        {/* Paragraph 2 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono text-slate-300">Paragraph 2 (Philosophy & Track Record)</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-400 hover:text-white">
              <input
                type="checkbox"
                checked={formData.showStoryParagraph2 !== false}
                onChange={(e) => setFormData({ ...formData, showStoryParagraph2: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
              />
              <span>{formData.showStoryParagraph2 !== false ? "Visible" : "Hidden"}</span>
            </label>
          </div>
          {formData.showStoryParagraph2 !== false && (
            <textarea
              rows={3}
              value={formData.storyParagraph2 || ""}
              onChange={(e) => setFormData({ ...formData, storyParagraph2: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none leading-relaxed"
            />
          )}
        </div>

        {/* Additional Paragraphs */}
        {(formData.additionalParagraphs || []).map((p, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-300">Additional Paragraph #{idx + 1}</label>
              <button
                type="button"
                onClick={() => handleRemoveParagraph(idx)}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={p}
              onChange={(e) => {
                const updated = [...(formData.additionalParagraphs || [])];
                updated[idx] = e.target.value;
                setFormData({ ...formData, additionalParagraphs: updated });
              }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none leading-relaxed"
              placeholder="Write additional narrative details..."
            />
          </div>
        ))}
      </GlassCard>

      {/* 3. Studio Hardware & Workspace Environment */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Studio Environment & Instruments
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
              <input
                type="checkbox"
                checked={formData.showHardwareSpecs !== false}
                onChange={(e) => setFormData({ ...formData, showHardwareSpecs: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
              />
              <span>{formData.showHardwareSpecs !== false ? "Visible" : "Hidden"}</span>
            </label>

            {formData.showHardwareSpecs !== false && (
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
              >
                <Plus className="h-3 w-3" />
                <span>Add Spec</span>
              </button>
            )}
          </div>
        </div>

        {formData.showHardwareSpecs !== false && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-300">Hardware Card Title</label>
              <input
                type="text"
                value={formData.hardwareTitle || ""}
                onChange={(e) => setFormData({ ...formData, hardwareTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                placeholder="Studio Environment & Instruments"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.hardwareSpecs || []).map((spec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2"
                >
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => {
                        const updated = [...formData.hardwareSpecs];
                        updated[idx].label = e.target.value;
                        setFormData({ ...formData, hardwareSpecs: updated });
                      }}
                      className="w-full px-2 py-1 rounded-lg glass-input text-[11px] font-mono text-cyan-300 uppercase"
                      placeholder="Label (e.g. Display)"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const updated = [...formData.hardwareSpecs];
                        updated[idx].value = e.target.value;
                        setFormData({ ...formData, hardwareSpecs: updated });
                      }}
                      className="w-full px-2 py-1 rounded-lg glass-input text-xs text-slate-200"
                      placeholder="Specification details..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete spec"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* 4. Photo Showcase Card Overlays */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Photo Showcase Card
            </h3>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
            <input
              type="checkbox"
              checked={formData.showPhotoCard !== false}
              onChange={(e) => setFormData({ ...formData, showPhotoCard: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
            />
            <span>{formData.showPhotoCard !== false ? "Visible" : "Hidden"}</span>
          </label>
        </div>

        {formData.showPhotoCard !== false && (
          <div className="space-y-4">
            <MediaUploadInput
              label="Showcase Portrait Image or Video Media"
              value={formData.photoUrl || ""}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              category="about"
              helperText="Upload your custom photo portrait or media (supports PNG, JPG, WebP, SVG, MP4, WebM). Defaults to cube front / avatar if left empty."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Photo Overlay Tag</label>
                <input
                  type="text"
                  value={formData.photoOverlayTag || ""}
                  onChange={(e) => setFormData({ ...formData, photoOverlayTag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-cyan-300"
                  placeholder="Spatial Technologist"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Photo Overlay Name</label>
                <input
                  type="text"
                  value={formData.photoOverlayName || ""}
                  onChange={(e) => setFormData({ ...formData, photoOverlayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white font-bold"
                  placeholder="Monu Gupta"
                />
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* 5. Philosophy & Core Principles Pillars */}
      <GlassCard className="p-6 space-y-5 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Philosophy & Core Principles Pillars
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
              <input
                type="checkbox"
                checked={formData.showPhilosophy !== false}
                onChange={(e) => setFormData({ ...formData, showPhilosophy: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-cyan-400 h-3.5 w-3.5"
              />
              <span>{formData.showPhilosophy !== false ? "Visible" : "Hidden"}</span>
            </label>

            {formData.showPhilosophy !== false && (
              <button
                type="button"
                onClick={handleAddPillar}
                className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
              >
                <Plus className="h-3 w-3" />
                <span>Add Pillar</span>
              </button>
            )}
          </div>
        </div>

        {formData.showPhilosophy !== false && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-300">Pillars Section Title</label>
              <input
                type="text"
                value={formData.philosophyTitle || ""}
                onChange={(e) => setFormData({ ...formData, philosophyTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white font-bold"
                placeholder="Core Principles"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Pillar 0{idx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePillarUp(idx)}
                        className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.coreValues.length - 1}
                        onClick={() => handleMovePillarDown(idx)}
                        className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePillar(idx)}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 ml-1 transition-all"
                        title="Delete Pillar"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) => {
                      const updated = [...formData.coreValues];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, coreValues: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-white"
                    placeholder="Pillar Title"
                  />

                  <textarea
                    rows={2}
                    value={val.desc}
                    onChange={(e) => {
                      const updated = [...formData.coreValues];
                      updated[idx].desc = e.target.value;
                      setFormData({ ...formData, coreValues: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs resize-none text-slate-300"
                    placeholder="Description of principle"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </form>
  );
}
