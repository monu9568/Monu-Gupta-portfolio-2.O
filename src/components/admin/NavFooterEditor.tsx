"use client";

import React, { useState } from "react";
import {
  Save,
  Check,
  Compass,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Link2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  LayoutTemplate,
  Clock,
  ArrowUp,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { SiteSettingsData, NavItem, FooterLink } from "@/lib/types";

interface NavFooterEditorProps {
  settings: SiteSettingsData;
  onSave: (updated: Partial<SiteSettingsData>) => Promise<void>;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "#home", visible: true },
  { id: "projects", label: "Projects", href: "#projects", visible: true },
  { id: "skills", label: "Skills", href: "#skills", visible: true },
  { id: "experience", label: "Experience", href: "#experience", visible: true },
  { id: "about", label: "About", href: "#about", visible: true },
  { id: "contact", label: "Contact", href: "#contact", visible: true },
];

export default function NavFooterEditor({ settings, onSave }: NavFooterEditorProps) {
  const [formData, setFormData] = useState<SiteSettingsData>({
    ...settings,
    headerMonogram: settings.headerMonogram || "MG",
    showHeaderCmsLink: settings.showHeaderCmsLink !== false,
    navItems:
      settings.navItems && settings.navItems.length > 0
        ? settings.navItems
        : DEFAULT_NAV_ITEMS,
    showFooter: settings.showFooter !== false,
    footerMonogram: settings.footerMonogram || "MG",
    footerName: settings.footerName || "Monu Gupta",
    footerCopyright:
      settings.footerCopyright || `© ${new Date().getFullYear()} • All Rights Reserved`,
    footerStatusTag: settings.footerStatusTag || "Spatial Engine 2.0",
    showLiveClock: settings.showLiveClock !== false,
    showBackToTop: settings.showBackToTop !== false,
    footerLinks: settings.footerLinks || [],
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFieldChange = (field: keyof SiteSettingsData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Nav Items Actions
  const handleNavItemChange = (idx: number, field: keyof NavItem, value: any) => {
    const updated = [...(formData.navItems || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, navItems: updated }));
  };

  const handleAddNavItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: "New Link",
      href: "#new-section",
      visible: true,
    };
    setFormData((prev) => ({
      ...prev,
      navItems: [...(prev.navItems || []), newItem],
    }));
  };

  const handleDeleteNavItem = (idx: number) => {
    const updated = [...(formData.navItems || [])];
    updated.splice(idx, 1);
    setFormData((prev) => ({ ...prev, navItems: updated }));
  };

  const handleResetNav = () => {
    setFormData((prev) => ({ ...prev, navItems: DEFAULT_NAV_ITEMS }));
  };

  // Footer Links Actions
  const handleFooterLinkChange = (idx: number, field: keyof FooterLink, value: string) => {
    const updated = [...(formData.footerLinks || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, footerLinks: updated }));
  };

  const handleAddFooterLink = () => {
    const newLink: FooterLink = {
      id: `footer-link-${Date.now()}`,
      label: "Privacy Policy",
      href: "#",
    };
    setFormData((prev) => ({
      ...prev,
      footerLinks: [...(prev.footerLinks || []), newLink],
    }));
  };

  const handleDeleteFooterLink = (idx: number) => {
    const updated = [...(formData.footerLinks || [])];
    updated.splice(idx, 1);
    setFormData((prev) => ({ ...prev, footerLinks: updated }));
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
      alert("Failed to save Navigation and Footer settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Navigation Bar & Footer Studio
          </h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Full control to edit, add, hide, and delete Header navigation links, brand monogram, and Footer components.
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
              <span>Save Nav & Footer</span>
            </>
          )}
        </button>
      </div>

      {/* Header & Navbar Controls */}
      <GlassCard className="p-6 space-y-6 border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Floating VisionOS Header & Navigation
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetNav}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-400 hover:text-white transition-all"
              title="Reset to default sections"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Default Links</span>
            </button>

            <button
              type="button"
              onClick={handleAddNavItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Nav Link</span>
            </button>
          </div>
        </div>

        {/* Monogram & CMS Link Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Header Monogram / Logo Text
            </label>
            <input
              type="text"
              value={formData.headerMonogram || "MG"}
              onChange={(e) => handleFieldChange("headerMonogram", e.target.value)}
              placeholder="MG"
              maxLength={4}
              className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono text-cyan-300 font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono">
              Displayed inside the circular glass avatar on the header.
            </span>
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Header Shortcuts
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] p-3 rounded-xl border border-white/10">
              <input
                type="checkbox"
                checked={formData.showHeaderCmsLink !== false}
                onChange={(e) => handleFieldChange("showHeaderCmsLink", e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-cyan-400"
              />
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Show CMS Quick Link in Navbar</span>
            </label>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider">
            Navigation Menu Items (Reorder / Edit / Hide / Delete)
          </label>

          <div className="space-y-2.5">
            {(formData.navItems || []).map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border transition-all ${
                  item.visible !== false
                    ? "bg-white/[0.02] border-white/10"
                    : "bg-white/[0.01] border-white/5 opacity-60"
                }`}
              >
                {/* Link Label */}
                <div className="flex-1 space-y-1">
                  <span className="block text-[10px] font-mono text-slate-500">Label</span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleNavItemChange(idx, "label", e.target.value)}
                    placeholder="Projects"
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-semibold text-white"
                  />
                </div>

                {/* Link Target URL/Anchor */}
                <div className="flex-1 space-y-1">
                  <span className="block text-[10px] font-mono text-slate-500">Target (#id or URL)</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleNavItemChange(idx, "href", e.target.value)}
                      placeholder="#projects"
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg glass-input text-xs font-mono text-slate-300"
                    />
                    <Link2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>

                {/* Visibility Toggle & Delete */}
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleNavItemChange(idx, "visible", item.visible === false)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      item.visible !== false
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                        : "bg-white/[0.04] text-slate-500 border border-white/10"
                    }`}
                    title={item.visible !== false ? "Visible in header" : "Hidden from header"}
                  >
                    {item.visible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{item.visible !== false ? "Visible" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNavItem(idx)}
                    className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 flex items-center justify-center transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Footer Controls */}
      <GlassCard className="p-6 space-y-6 border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Footer & Telemetry Studio
            </h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10">
            <input
              type="checkbox"
              checked={formData.showFooter !== false}
              onChange={(e) => handleFieldChange("showFooter", e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-cyan-400"
            />
            <span>{formData.showFooter !== false ? "Footer Visible" : "Footer Hidden"}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Footer Brand Name
            </label>
            <input
              type="text"
              value={formData.footerName || ""}
              onChange={(e) => handleFieldChange("footerName", e.target.value)}
              placeholder="Monu Gupta"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Footer Monogram
            </label>
            <input
              type="text"
              value={formData.footerMonogram || "MG"}
              onChange={(e) => handleFieldChange("footerMonogram", e.target.value)}
              placeholder="MG"
              maxLength={4}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono text-cyan-300 font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Copyright Notice
            </label>
            <input
              type="text"
              value={formData.footerCopyright || ""}
              onChange={(e) => handleFieldChange("footerCopyright", e.target.value)}
              placeholder={`© ${new Date().getFullYear()} • All Rights Reserved`}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">
              System Status Tag
            </label>
            <input
              type="text"
              value={formData.footerStatusTag || ""}
              onChange={(e) => handleFieldChange("footerStatusTag", e.target.value)}
              placeholder="Spatial Engine 2.0"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono text-emerald-400"
            />
          </div>
        </div>

        {/* Footer Feature Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-3 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <input
              type="checkbox"
              checked={formData.showLiveClock !== false}
              onChange={(e) => handleFieldChange("showLiveClock", e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-cyan-400"
            />
            <Clock className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="block font-medium text-white">Live System Clock</span>
              <span className="text-[10px] text-slate-500 font-light">Show dynamic real-time clock in footer</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs font-mono text-slate-300 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <input
              type="checkbox"
              checked={formData.showBackToTop !== false}
              onChange={(e) => handleFieldChange("showBackToTop", e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-cyan-400"
            />
            <ArrowUp className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="block font-medium text-white">Scroll to Top Button</span>
              <span className="text-[10px] text-slate-500 font-light">Floating round smooth-scroll trigger</span>
            </div>
          </label>
        </div>

        {/* Custom Footer Links */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider">
              Additional Footer Links
            </label>
            <button
              type="button"
              onClick={handleAddFooterLink}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-300 transition-all"
            >
              <Plus className="h-3 w-3" />
              <span>Add Footer Link</span>
            </button>
          </div>

          {(formData.footerLinks || []).length === 0 ? (
            <p className="text-xs font-mono text-slate-500 italic p-3 rounded-xl bg-white/[0.01] border border-white/5">
              No custom footer links added yet. Click &ldquo;Add Footer Link&rdquo; to add privacy policies, terms, or secondary links.
            </p>
          ) : (
            <div className="space-y-2">
              {(formData.footerLinks || []).map((fl, idx) => (
                <div
                  key={fl.id || idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/10"
                >
                  <input
                    type="text"
                    value={fl.label}
                    onChange={(e) => handleFooterLinkChange(idx, "label", e.target.value)}
                    placeholder="Link Label"
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs font-mono text-white"
                  />
                  <input
                    type="text"
                    value={fl.href}
                    onChange={(e) => handleFooterLinkChange(idx, "href", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs font-mono text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteFooterLink(idx)}
                    className="h-7 w-7 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </form>
  );
}
