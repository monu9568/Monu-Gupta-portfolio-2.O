"use client";

import React, { useState } from "react";
import {
  Save,
  Check,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Layers,
  Palette,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { HeroData, HeroStat } from "@/lib/types";
import MediaUploadInput from "./MediaUploadInput";

interface HeroEditorProps {
  hero: HeroData;
  onSave: (updated: Partial<HeroData>) => Promise<void>;
}

const COLOR_OPTIONS = [
  { label: "Pure White", value: "text-white", bg: "bg-white" },
  { label: "Cyan Glow", value: "text-cyan-400", bg: "bg-cyan-400" },
  { label: "Indigo Glow", value: "text-indigo-400", bg: "bg-indigo-400" },
  { label: "Emerald Glow", value: "text-emerald-400", bg: "bg-emerald-400" },
  { label: "Amber Glow", value: "text-amber-400", bg: "bg-amber-400" },
  { label: "Rose Glow", value: "text-rose-400", bg: "bg-rose-400" },
];

export default function HeroEditor({ hero, onSave }: HeroEditorProps) {
  const [formData, setFormData] = useState<HeroData>({
    ...hero,
    headlinePrefix: hero.headlinePrefix !== undefined ? hero.headlinePrefix : "Building",
    headlineGradient: hero.headlineGradient !== undefined ? hero.headlineGradient : "Digital Products",
    headlineSuffix: hero.headlineSuffix !== undefined ? hero.headlineSuffix : "Powered by Design & Data.",
    showAvailabilityTag: hero.showAvailabilityTag !== false,
    showIdentitySubtitle: hero.showIdentitySubtitle !== false,
    showStats: hero.showStats !== false,
    stats:
      hero.stats && hero.stats.length > 0
        ? hero.stats
        : [
            { id: "stat-1", value: "6+", label: "Years Craft", color: "text-white" },
            { id: "stat-2", value: "120 FPS", label: "Native WebGL", color: "text-cyan-400" },
            { id: "stat-3", value: "99+", label: "Lighthouse", color: "text-white" },
            { id: "stat-4", value: "VisionOS", label: "Spatial UI", color: "text-indigo-400" },
          ],
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof HeroData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (idx: number, field: keyof HeroStat, value: string) => {
    const updatedStats = [...(formData.stats || [])];
    updatedStats[idx] = { ...updatedStats[idx], [field]: value };
    setFormData((prev) => ({ ...prev, stats: updatedStats }));
  };

  const handleAddStat = () => {
    const newStat: HeroStat = {
      id: `stat-${Date.now()}`,
      value: "100%",
      label: "New Metric",
      color: "text-cyan-400",
    };
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), newStat],
    }));
  };

  const handleDeleteStat = (idx: number) => {
    const updatedStats = [...(formData.stats || [])];
    updatedStats.splice(idx, 1);
    setFormData((prev) => ({ ...prev, stats: updatedStats }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save hero content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Hero Section & Identity Studio</h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Configure main titles, headline gradients, metrics badges, elevator pitch, 3D cube imagery, and CTA buttons.
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
              <span>Save Hero Data</span>
            </>
          )}
        </button>
      </div>

      {/* Main Headline & Identity Typography */}
      <GlassCard className="p-6 space-y-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Main Headline & Identity Title
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Live Typography Controls</span>
        </div>

        {/* Headline 3-Part Builder */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Primary Headline Structure
            </label>
            <span className="text-[10px] font-mono text-cyan-400">
              Prefix • Gradient Highlight • Suffix
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400">Headline Prefix (Row 1)</span>
              <input
                type="text"
                value={formData.headlinePrefix || ""}
                onChange={(e) => handleChange("headlinePrefix", e.target.value)}
                placeholder="Building"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-white"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400">Gradient Highlight (Row 2)</span>
              <input
                type="text"
                value={formData.headlineGradient || ""}
                onChange={(e) => handleChange("headlineGradient", e.target.value)}
                placeholder="Digital Products"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-cyan-300 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400">Headline Suffix (Row 3)</span>
              <input
                type="text"
                value={formData.headlineSuffix || ""}
                onChange={(e) => handleChange("headlineSuffix", e.target.value)}
                placeholder="Powered by Design & Data."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 mt-2">
            <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase tracking-wider">
              Headline Live Preview
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {formData.headlinePrefix || "Building"} <br />
              <span className="text-gradient-cyan">
                {formData.headlineGradient || "Digital Products"}
              </span>{" "}
              <br />
              {formData.headlineSuffix || "Powered by Design & Data."}
            </div>
          </div>
        </div>

        {/* Name & Professional Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase text-slate-300">Name</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.showIdentitySubtitle !== false}
                  onChange={(e) => handleChange("showIdentitySubtitle", e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-cyan-400"
                />
                <span>Show Subtitle Tag</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Professional Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Availability Tag */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase text-slate-300">Availability Tag</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-slate-400">
              <input
                type="checkbox"
                checked={formData.showAvailabilityTag !== false}
                onChange={(e) => handleChange("showAvailabilityTag", e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-cyan-400"
              />
              <span>Show Availability Pill</span>
            </label>
          </div>
          <input
            type="text"
            value={formData.availabilityTag}
            onChange={(e) => handleChange("availabilityTag", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Bio Narrative */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-slate-300">Bio Narrative</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>
      </GlassCard>

      {/* Hero Metric Stats Manager */}
      <GlassCard className="p-6 space-y-5 border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Floating Metric Stats & Performance Badges
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10">
              <input
                type="checkbox"
                checked={formData.showStats !== false}
                onChange={(e) => handleChange("showStats", e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-cyan-400"
              />
              <span>{formData.showStats !== false ? "Visible on Hero" : "Hidden"}</span>
            </label>

            <button
              type="button"
              onClick={handleAddStat}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Metric</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-light">
          Customize, add, delete, or hide the key metric badges that appear directly beneath the Hero CTA buttons.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {(formData.stats || []).map((stat, idx) => (
            <div
              key={stat.id || idx}
              className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 group hover:border-white/25 transition-all"
            >
              <button
                type="button"
                onClick={() => handleDeleteStat(idx)}
                className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 flex items-center justify-center transition-colors"
                title="Delete metric"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-slate-400">
                  Value / Metric
                </label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                  placeholder="6+"
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-sm font-bold text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-slate-400">
                  Label Text
                </label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                  placeholder="Years Craft"
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-slate-400">
                  Color Accent
                </label>
                <select
                  value={stat.color || "text-white"}
                  onChange={(e) => handleStatChange(idx, "color", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono text-slate-200 bg-[#090b10]"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#090b10] text-slate-200">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Call to Actions & Direct Links */}
      <GlassCard className="p-6 space-y-5 border border-white/10">
        <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider text-cyan-400">
          Calls to Action & Social Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Primary CTA Text</label>
            <input
              type="text"
              value={formData.primaryCtaText}
              onChange={(e) => handleChange("primaryCtaText", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Primary CTA Link</label>
            <input
              type="text"
              value={formData.primaryCtaLink}
              onChange={(e) => handleChange("primaryCtaLink", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Secondary CTA Text</label>
            <input
              type="text"
              value={formData.secondaryCtaText}
              onChange={(e) => handleChange("secondaryCtaText", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Secondary CTA Link</label>
            <input
              type="text"
              value={formData.secondaryCtaLink}
              onChange={(e) => handleChange("secondaryCtaLink", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">GitHub Profile URL</label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => handleChange("githubUrl", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">LinkedIn Profile URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleChange("linkedinUrl", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Twitter / X Profile URL</label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => handleChange("twitterUrl", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>
      </GlassCard>

      {/* 3D Identity Cube Image Textures */}
      <GlassCard className="p-6 space-y-6 border border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>3D Personal Identity Cube Faces</span>
          </h3>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Upload custom photos or choose from the Media Library for all 6 faces of the 3D WebGL glass cube.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <MediaUploadInput
              label="Front Face (Portrait)"
              value={formData.cubeFrontImg}
              onChange={(url) => handleChange("cubeFrontImg", url)}
              category="personal"
              helperText="Primary camera-facing portrait"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <MediaUploadInput
              label="Right Face (Creative / Spatial)"
              value={formData.cubeRightImg}
              onChange={(url) => handleChange("cubeRightImg", url)}
              category="personal"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <MediaUploadInput
              label="Back Face (Lifestyle / Vision)"
              value={formData.cubeBackImg}
              onChange={(url) => handleChange("cubeBackImg", url)}
              category="personal"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <MediaUploadInput
              label="Left Face (Code & Dev)"
              value={formData.cubeLeftImg}
              onChange={(url) => handleChange("cubeLeftImg", url)}
              category="personal"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <MediaUploadInput
              label="Top Face (Studio / Hardware)"
              value={formData.cubeTopImg}
              onChange={(url) => handleChange("cubeTopImg", url)}
              category="personal"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <MediaUploadInput
              label="Bottom Face (Alternative Angle)"
              value={formData.cubeBottomImg}
              onChange={(url) => handleChange("cubeBottomImg", url)}
              category="personal"
            />
          </div>
        </div>
      </GlassCard>
    </form>
  );
}
