"use client";

import React, { useState } from "react";
import { Save, Check, KeyRound, Download, Upload, RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { SiteSettingsData } from "@/lib/types";
import MediaUploadInput from "./MediaUploadInput";

interface SettingsEditorProps {
  settings: SiteSettingsData;
  onSaveSettings: (settings: Partial<SiteSettingsData>) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export default function SettingsEditor({ settings, onSaveSettings, onRefreshData }: SettingsEditorProps) {
  const [formData, setFormData] = useState<SiteSettingsData>(settings);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Credentials change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setPwdStatus({ type: "error", msg: "New passwords do not match" });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setPwdStatus({ type: "error", msg: "New password must be at least 6 characters" });
      return;
    }
    if (!newPassword && !newUsername.trim()) {
      setPwdStatus({ type: "error", msg: "Please enter a new username or new password to update." });
      return;
    }

    setPwdLoading(true);
    setPwdStatus(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          password: currentPassword,
          newPassword: newPassword || undefined,
          newUsername: newUsername.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credentials update failed");

      setPwdStatus({
        type: "success",
        msg: `Admin credentials successfully updated.${data.username ? ` Active username: ${data.username}` : ""}`,
      });
      setCurrentPassword("");
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdStatus({ type: "error", msg: err.message || "Failed to update credentials" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleExportBackup = async () => {

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_backup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Export failed");

      const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export backup");
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (confirm("Restore portfolio database from this JSON backup? Existing content will be overwritten.")) {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "import_backup", backupData }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Import failed");
        alert(json.message);
        await onRefreshData();
      }
    } catch (err: any) {
      alert("Invalid backup file: " + err.message);
    }
  };

  const handleResetDefaults = async () => {
    if (confirm("Are you sure you want to reset all portfolio content to factory defaults?")) {
      try {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_defaults" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Reset failed");
        alert(json.message);
        await onRefreshData();
      } catch (err: any) {
        alert(err.message || "Failed to reset");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* SEO & Site Metadata */}
      <form onSubmit={handleSubmitSettings} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">SEO & Global Parameters</h2>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Search engine optimization, OpenGraph social previews, and primary accent styling.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-950" />
                <span>Saved Successfully</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save SEO Config</span>
              </>
            )}
          </button>
        </div>

        <GlassCard className="p-6 space-y-4 border border-white/10">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Page Meta Title</label>
            <input
              type="text"
              value={formData.siteTitle}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-slate-300">Meta Description</label>
            <textarea
              rows={2}
              value={formData.metaDesc}
              onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          <div className="space-y-4 pt-2">
            <MediaUploadInput
              label="OpenGraph Social Share Preview Image"
              value={formData.ogImageUrl || ""}
              onChange={(url) => setFormData({ ...formData, ogImageUrl: url })}
              category="ui"
              helperText="Image displayed when portfolio URL is shared on Twitter / LinkedIn"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300">Accent Color Hex</label>
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                placeholder="#38bdf8"
              />
            </div>
          </div>
        </GlassCard>

        {/* Digital Rights, Content Protection & Screenshot Shield */}
        <div className="pt-2 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Digital Rights & Content Protection Shield</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Protect your portfolio media, project images, video assets, and designs from unauthorized theft and screen captures.
            </p>
          </div>

          <GlassCard className="p-6 space-y-4 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Block Screenshot Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.blockScreenshots !== false}
                  onChange={(e) => setFormData({ ...formData, blockScreenshots: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-400 accent-cyan-500"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-white">Block Screenshots</span>
                  <span className="block text-[11px] text-slate-400 font-light leading-tight">
                    Intercepts PrintScreen, Snipping tool, and shortcuts (Ctrl+P, Ctrl+S).
                  </span>
                </div>
              </label>

              {/* Disable Right Click Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.disableRightClick !== false}
                  onChange={(e) => setFormData({ ...formData, disableRightClick: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-400 accent-cyan-500"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-white">Disable Right-Click</span>
                  <span className="block text-[11px] text-slate-400 font-light leading-tight">
                    Blocks right-click context menu across images, canvas, and layout.
                  </span>
                </div>
              </label>

              {/* Disable Media Drag & Drop */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.disableMediaSave !== false}
                  onChange={(e) => setFormData({ ...formData, disableMediaSave: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-400 accent-cyan-500"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-white">Prevent Media Drag & Save</span>
                  <span className="block text-[11px] text-slate-400 font-light leading-tight">
                    Disables dragging images/videos to desktop and touch-callouts on mobile.
                  </span>
                </div>
              </label>
            </div>
          </GlassCard>
        </div>
      </form>


      {/* Master Credentials Security Management */}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-cyan-400" />
            <span>Admin Credentials & Security</span>
          </h3>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Update your admin username and master password. Passwords are encrypted with salted PBKDF2.
          </p>
        </div>

        <GlassCard className="p-6 space-y-4 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                placeholder="Current password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300">New Username (Optional)</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                placeholder="e.g. monu_admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300">New Password (Optional)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                placeholder="New password (min 6 chars)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {pwdStatus && (
            <div
              className={`p-3 rounded-xl text-xs ${
                pwdStatus.type === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
              }`}
            >
              {pwdStatus.msg}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-white transition-colors"
            >
              {pwdLoading ? "Updating..." : "Update Admin Credentials"}
            </button>
          </div>
        </GlassCard>
      </form>


      {/* Database Backup & Disaster Recovery */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Database Backup & Restoration</span>
          </h3>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Export a full snapshot of your portfolio data or restore from a JSON backup.
          </p>
        </div>

        <GlassCard className="p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white transition-all"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white transition-all cursor-pointer">
              <Upload className="h-4 w-4 text-indigo-400" />
              <span>Import JSON Backup</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-400 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Factory Defaults</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
