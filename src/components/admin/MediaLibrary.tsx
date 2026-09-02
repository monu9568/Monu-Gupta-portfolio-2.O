"use client";

import React, { useState, useEffect } from "react";
import { Upload, Copy, Check, Image as ImageIcon, Video, RefreshCw, Folder, Trash2, Loader2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import Image from "next/image";
import { upload } from "@vercel/blob/client";


interface MediaAsset {
  name: string;
  url: string;
  category: string;
  size: number;
  isVideo?: boolean;
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) setAssets(data);
    } catch {
      console.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];
    const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov|ogg)$/i);
    const category = isVideo ? "video" : (selectedCategory === "all" ? "projects" : selectedCategory);

    try {
      let success = false;

      // 1. Try Direct Client Upload to Vercel Blob (supports up to 250MB)
      try {
        const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const newBlob = await upload(cleanName, file, {
          access: "public",
          handleUploadUrl: "/api/media/upload",
        });
        if (newBlob && newBlob.url) {
          success = true;
        }
      } catch (blobErr: any) {
        console.warn("Direct blob upload bypassed, falling back to server route:", blobErr?.message);
      }

      // 2. Fallback to /api/media POST
      if (!success) {
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
            throw new Error("File exceeds serverless limit. Please connect Vercel Blob.");
          }
          throw new Error("Invalid server response");
        }

        if (!res.ok) throw new Error(data.error || "Upload failed");
      }

      await fetchAssets();
      alert("File uploaded successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAsset = async (url: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/media?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await fetchAssets();
    } catch (err: any) {
      alert(err.message || "Failed to delete file");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const filtered = selectedCategory === "all"
    ? assets
    : assets.filter((a) => a.category === selectedCategory || (selectedCategory === "video" && a.isVideo));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Media Asset Library</h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Manage high-resolution photography, 3D cube textures, and project showcase visual assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Media</span>
              </>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          <button
            onClick={fetchAssets}
            className="p-2 rounded-xl bg-white/[0.05] text-slate-300 hover:text-white"
            title="Refresh assets"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2">
        {["all", "personal", "projects", "ui", "video"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
              selectedCategory === cat
                ? "bg-white/[0.12] text-white border border-white/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 text-cyan-400 text-xs font-mono">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>SCANNING ASSET DIRECTORIES...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs font-mono text-slate-500">
            No media files found in this category.
          </div>
        ) : (
          filtered.map((asset, idx) => (
            <GlassCard key={idx} className="p-3 border border-white/10 group space-y-2 relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40 border border-white/10">
                {asset.isVideo ? (
                  <div className="relative h-full w-full flex items-center justify-center bg-slate-900">
                    <Video className="h-8 w-8 text-cyan-400" />
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[8px] font-mono text-cyan-300">
                      VIDEO
                    </span>
                  </div>
                ) : (
                  <Image src={asset.url} alt={asset.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                )}

                {/* Delete overlay button */}
                <button
                  onClick={() => handleDeleteAsset(asset.url, asset.name)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  title="Delete asset"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-300 block truncate" title={asset.name}>
                  {asset.name}
                </span>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                  <span className="capitalize">{asset.category}</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(asset.url)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
              >
                {copiedUrl === asset.url ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Path Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
