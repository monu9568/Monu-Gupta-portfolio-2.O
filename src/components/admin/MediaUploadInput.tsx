"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Folder, X, Check, Image as ImageIcon, Video, FileText, Loader2, Link2, Eye } from "lucide-react";
import Image from "next/image";
import SmartMedia from "../ui/SmartMedia";

import { upload } from "@vercel/blob/client";

interface MediaAsset {
  name: string;
  url: string;
  category: string;
  size: number;
  isVideo?: boolean;
  isPdf?: boolean;
}

interface MediaUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  category?: "projects" | "personal" | "ui" | "video" | "certificates" | string;
  accept?: string;
  placeholder?: string;
  helperText?: string;
  allowVideo?: boolean;
}

export default function MediaUploadInput({
  label,
  value,
  onChange,
  category = "projects",
  accept = "image/*,video/*,application/pdf,.pdf",
  placeholder = "/images/...",
  helperText,
  allowVideo = true,
}: MediaUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<MediaAsset[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = Boolean(
    value && (value.match(/\.(mp4|webm|mov|ogg)$/i) || value.includes("/video/"))
  );

  const isPdf = Boolean(
    value && (value.toLowerCase().endsWith(".pdf") || value.includes(".pdf?"))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      let finalUrl = "";

      // 1. Try Direct Vercel Blob Client Upload (Supports up to 250MB directly to Vercel CDN)
      try {
        const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const newBlob = await upload(cleanName, file, {
          access: "public",
          handleUploadUrl: "/api/media/upload",
        });
        if (newBlob && newBlob.url) {
          finalUrl = newBlob.url;
        }
      } catch (blobErr: any) {
        console.warn("Direct blob upload bypassed, falling back to server route:", blobErr?.message);
      }

      // 2. Fallback to /api/media POST if direct blob wasn't available
      if (!finalUrl) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch {
          if (resText.includes("413") || resText.includes("Request Entity Too Large")) {
            throw new Error("File exceeds serverless limit. Please ensure Vercel Blob is connected.");
          }
          throw new Error("Invalid response from server");
        }

        if (!res.ok) throw new Error(data.error || "Upload failed");
        finalUrl = data.url;
      }

      if (finalUrl) {
        onChange(finalUrl);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLibraryAssets(data);
      }
    } catch {
      console.error("Failed to load media library");
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleOpenLibrary = () => {
    setShowLibrary(true);
    fetchLibrary();
  };

  const filteredAssets = libraryCategory === "all"
    ? libraryAssets
    : libraryAssets.filter((a) =>
        a.category === libraryCategory ||
        (libraryCategory === "video" && a.isVideo) ||
        (libraryCategory === "pdf" && a.isPdf)
      );

  return (
    <div className="space-y-2">
      {/* Label and Helper Text */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
          {label}
        </label>
        {helperText && <span className="text-[10px] text-slate-500 font-mono">{helperText}</span>}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Media Preview Box */}
        <div className="relative h-20 w-24 rounded-xl border border-white/15 bg-black/40 overflow-hidden flex-shrink-0 flex items-center justify-center group shadow-inner">
          {value ? (
            <SmartMedia src={value} alt={label} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600">
              <ImageIcon className="h-6 w-6 stroke-1" />
              <span className="text-[9px] font-mono mt-1">No Media</span>
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              title="Remove media"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Input, Upload Button, and Library Selector */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs font-mono text-slate-200"
              />
              <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>

            {/* Direct File Upload Button */}
            <label
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex-shrink-0 ${
                uploading
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold shadow-sm hover:scale-105"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Pick from Library Button */}
            <button
              type="button"
              onClick={handleOpenLibrary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex-shrink-0"
              title="Choose from Media Library"
            >
              <Folder className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Selector Modal */}
      {showLibrary && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
        >
          <div
            data-lenis-prevent="true"
            className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#090b10] border border-white/15 p-6 shadow-glass-elevated flex flex-col text-left overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Select from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 py-3 border-b border-white/10 flex-shrink-0 overflow-x-auto">
              {["all", "personal", "projects", "ui", "video"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setLibraryCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                    libraryCategory === cat
                      ? "bg-white/[0.12] text-white border border-white/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Media Grid */}
            <div
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto py-4 pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overscroll-contain"
            >
              {loadingLibrary ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 text-cyan-400 text-xs font-mono">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>LOADING ASSETS...</span>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs font-mono text-slate-500">
                  No assets found in this category.
                </div>
              ) : (
                filteredAssets.map((asset, idx) => {
                  const isSelected = value === asset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        onChange(asset.url);
                        setShowLibrary(false);
                      }}
                      className={`group relative rounded-xl border p-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/60">
                        <SmartMedia src={asset.url} alt={asset.name} fill showBadge={asset.isVideo} className="object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md z-10">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="mt-1 px-1">
                        <span className="block text-[10px] font-mono text-slate-300 truncate" title={asset.name}>
                          {asset.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 capitalize">
                          {(asset.size / 1024 / 1024).toFixed(1)} MB • {asset.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] font-mono text-slate-500">
                {filteredAssets.length} assets available
              </span>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="px-4 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
