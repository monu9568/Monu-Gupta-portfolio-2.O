"use client";

import React, { useState } from "react";
import {
  Save,
  Check,
  Mail,
  Send,
  Github,
  Linkedin,
  Twitter,
  Tag,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { HeroData } from "@/lib/types";

interface ContactEditorProps {
  hero: HeroData;
  onSave: (updated: Partial<HeroData>) => Promise<void>;
}

export default function ContactEditor({ hero, onSave }: ContactEditorProps) {
  const [formData, setFormData] = useState<HeroData>({
    ...hero,
    contactBadge: hero.contactBadge || "INITIATE COLLABORATION",
    contactHeadingPrefix: hero.contactHeadingPrefix || "Let’s Build",
    contactHeadingGradient: hero.contactHeadingGradient || "Something Visionary.",
    contactSubtitle:
      hero.contactSubtitle ||
      "Available for bespoke WebGL installations, spatial UX architecture, advisory roles, and high-impact engineering projects.",
    contactDirectEmailLabel: hero.contactDirectEmailLabel || "Direct Email",
    contactFormTitle: hero.contactFormTitle || "Send a Message",
    contactFormSubtitle:
      hero.contactFormSubtitle ||
      "Have a project in mind, a question, or a collaboration opportunity? Reach out anytime.",
    contactSubmitButtonText: hero.contactSubmitButtonText || "Send Message",
    showGithubLink: hero.showGithubLink !== false,
    showLinkedinLink: hero.showLinkedinLink !== false,
    showTwitterLink: hero.showTwitterLink !== false,
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
      alert("Failed to save contact settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Contact & Enquiry Form Studio
          </h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Customize the live collaboration banner, headings, direct email, verified channels, and inquiry form.
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
              <span>Save Contact Section</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Left Column: Banner & Headings */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>Left Banner Headings & Description</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Pill Badge Tag</label>
            <input
              type="text"
              value={formData.contactBadge || ""}
              onChange={(e) => setFormData({ ...formData, contactBadge: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              placeholder="INITIATE COLLABORATION"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Headline Prefix</label>
            <input
              type="text"
              value={formData.contactHeadingPrefix || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactHeadingPrefix: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-sm font-bold text-white"
              placeholder="Let’s Build"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-cyan-400 font-semibold">
              Headline Gradient Word
            </label>
            <input
              type="text"
              value={formData.contactHeadingGradient || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactHeadingGradient: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-sm font-bold text-cyan-300"
              placeholder="Something Visionary."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono text-slate-300">
            Subtitle / Collaboration Pitch
          </label>
          <textarea
            rows={2}
            value={formData.contactSubtitle || ""}
            onChange={(e) => setFormData({ ...formData, contactSubtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs leading-relaxed"
            placeholder="Available for bespoke WebGL installations, spatial UX architecture..."
          />
        </div>
      </GlassCard>

      {/* 2. Direct Email & Verified Social Channels */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Direct Email & Verified Channels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Direct Email Label</label>
            <input
              type="text"
              value={formData.contactDirectEmailLabel || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactDirectEmailLabel: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              placeholder="Direct Email"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">
              Direct Contact Email Address <span className="text-cyan-400">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-cyan-300"
              placeholder="contact@monugupta.design"
            />
          </div>
        </div>

        {/* Verified Social Channels with Show / Hide toggles */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <span className="text-xs font-mono uppercase text-slate-400 block font-semibold">
            Verified Channels & External Profiles
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* GitHub */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5 text-slate-400" />
                  <span>GitHub</span>
                </span>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] font-mono text-slate-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={formData.showGithubLink !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, showGithubLink: e.target.checked })
                    }
                    className="rounded border-white/20 bg-white/5 text-cyan-400 h-3 w-3"
                  />
                  <span>{formData.showGithubLink !== false ? "Visible" : "Hidden"}</span>
                </label>
              </div>
              <input
                type="url"
                value={formData.githubUrl || ""}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                placeholder="https://github.com/..."
              />
            </div>

            {/* LinkedIn */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                  <Linkedin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>LinkedIn</span>
                </span>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] font-mono text-slate-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={formData.showLinkedinLink !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, showLinkedinLink: e.target.checked })
                    }
                    className="rounded border-white/20 bg-white/5 text-cyan-400 h-3 w-3"
                  />
                  <span>{formData.showLinkedinLink !== false ? "Visible" : "Hidden"}</span>
                </label>
              </div>
              <input
                type="url"
                value={formData.linkedinUrl || ""}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            {/* Twitter / X */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                  <Twitter className="h-3.5 w-3.5 text-sky-400" />
                  <span>X (Twitter)</span>
                </span>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] font-mono text-slate-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={formData.showTwitterLink !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, showTwitterLink: e.target.checked })
                    }
                    className="rounded border-white/20 bg-white/5 text-cyan-400 h-3 w-3"
                  />
                  <span>{formData.showTwitterLink !== false ? "Visible" : "Hidden"}</span>
                </label>
              </div>
              <input
                type="url"
                value={formData.twitterUrl || ""}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                placeholder="https://x.com/..."
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Right Column: Inquiry Form Customization */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Interactive Inquiry Form Labels & Button</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Form Card Heading</label>
            <input
              type="text"
              value={formData.contactFormTitle || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactFormTitle: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-sm font-semibold text-white"
              placeholder="Send Encrypted Inquiry"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Submit Button Text</label>
            <input
              type="text"
              value={formData.contactSubmitButtonText || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactSubmitButtonText: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-sm font-bold text-cyan-300 font-mono"
              placeholder="Transmit Message"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono text-slate-300">
            Form Subtitle / Privacy Notice
          </label>
          <input
            type="text"
            value={formData.contactFormSubtitle || ""}
            onChange={(e) =>
              setFormData({ ...formData, contactFormSubtitle: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-300"
            placeholder="Messages are securely routed directly to the developer's private dashboard."
          />
        </div>
      </GlassCard>
    </form>
  );
}
