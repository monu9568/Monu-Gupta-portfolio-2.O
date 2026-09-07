"use client";

import React, { useState, useEffect } from "react";
import { Upload, Copy, Check, Image as ImageIcon, Video, RefreshCw, Folder, Trash2, Loader2, Sparkles, User, Box } from "lucide-react";
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
  const [applyingState, setApplyingState] = useState<{ [key: string]: string }>({});

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

  const notifySync = () => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("portfolio_cms_updates");
        channel.postMessage({ type: "cms_updated", timestamp: Date.now() });
        channel.close();
      }
    } catch {}
  };

  const handleQuickApply = async (url: string, target: "about_photo" | "cube_front" | "hero_avatar") => {
    const key = `${url}-${target}`;
    setApplyingState((prev) => ({ ...prev, [key]: "applying" }));

    try {
      let body: any = {};
      if (target === "about_photo") {
        body = { section: "about", data: { photoUrl: url, showPhotoCard: true } };
      } else if (target === "cube_front") {
        body = { section: "hero", data: { cubeFrontImg: url } };
      } else if (target === "hero_avatar") {
        body = { section: "hero", data: { avatarUrl: url } };
      }

      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to apply asset");
      notifySync();

      setApplyingState((prev) => ({ ...prev, [key]: "applied" }));
      setTimeout(() => {
        setApplyingState((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Failed to apply");
      setApplyingState((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }
  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".webp"),
                { type: "image/webp" }
              );
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const rawFile = files[0];
    const file = await optimizeImageForUpload(rawFile);
    const isVideo = file.type.startsWith("video/") || Boolean(file.name.match(/\.(mp4|webm|mov|ogg)$/i));
    const category = isVideo ? "video" : (selectedCategory === "all" ? "projects" : selectedCategory);

    try {
      let success = false;

      // 1. Primary: Direct Client Upload to Vercel Blob (supports up to 250MB)
      try {
        const cleanName = `${category}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const newBlob = await upload(cleanName, file, {
          access: "public",
          handleUploadUrl: "/api/media/upload",
        });
        if (newBlob && newBlob.url) {
          success = true;
        }
      } catch (blobErr: any) {
        console.warn("Direct blob upload notice, trying server route:", blobErr?.message);
      }

      // 2. Secondary fallback: /api/media POST
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
            throw new Error("File exceeds serverless limit. Please use direct cloud upload.");
          }
          throw new Error("Invalid server response");
        }

        if (!res.ok) throw new Error(data.error || "Upload failed");
      }

      await fetchAssets();
      notifySync();
      alert("File uploaded successfully to Media Library!");
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
      notifySync();
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
            Manage photography, 3D cube textures, and project visual assets with instant 1-click live assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 cursor-pointer shadow-sm">
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
            className="p-2 rounded-xl bg-white/[0.05] text-slate-300 hover:text-white transition-colors"
            title="Refresh assets"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          filtered.map((asset, idx) => {
            const isAboutApplying = applyingState[`${asset.url}-about_photo`];
            const isCubeApplying = applyingState[`${asset.url}-cube_front`];

            return (
              <GlassCard key={idx} className="p-3 border border-white/10 group space-y-2.5 relative flex flex-col justify-between">
                <div className="space-y-2">
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
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-slate-300 block truncate font-medium" title={asset.name}>
                      {asset.name}
                    </span>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                      <span className="capitalize">{asset.category}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  {!asset.isVideo && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickApply(asset.url, "about_photo")}
                        disabled={Boolean(isAboutApplying)}
                        className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-mono transition-all ${
                          isAboutApplying === "applied"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40"
                        }`}
                        title="Set as About Section Portrait Card"
                      >
                        {isAboutApplying === "applied" ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Saved!</span>
                          </>
                        ) : isAboutApplying === "applying" ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Applying</span>
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 text-cyan-400" />
                            <span>About Card</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickApply(asset.url, "cube_front")}
                        disabled={Boolean(isCubeApplying)}
                        className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-mono transition-all ${
                          isCubeApplying === "applied"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40"
                        }`}
                        title="Set as 3D Cube Front Face"
                      >
                        {isCubeApplying === "applied" ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Saved!</span>
                          </>
                        ) : isCubeApplying === "applying" ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Applying</span>
                          </>
                        ) : (
                          <>
                            <Box className="h-3 w-3 text-indigo-400" />
                            <span>Cube Front</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => copyToClipboard(asset.url)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
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
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
