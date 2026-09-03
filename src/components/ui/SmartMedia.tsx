"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Film, FileText, Image as ImageIcon, ExternalLink, Download } from "lucide-react";

import PdfCanvasViewer from "./PdfCanvasViewer";

interface SmartMediaProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  poster?: string;
  onClick?: (e: React.MouseEvent) => void;
  showBadge?: boolean;
  isFullView?: boolean;
}

// Global in-memory cache for media that have already buffered
const videoCache = new Set<string>();

export default function SmartMedia({
  src,
  alt,
  className = "",
  fill = false,
  priority = false,
  sizes,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  playsInline = true,
  poster,
  onClick,
  showBadge = true,
  isFullView = false,
}: SmartMediaProps) {
  const [error, setError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-4 text-center bg-white/[0.02] border border-white/5 select-none ${
          fill ? "absolute inset-0 w-full h-full" : "w-full h-full min-h-[160px]"
        }`}
      >
        <ImageIcon className="h-6 w-6 text-slate-500 mb-2 opacity-50" />
        <span className="text-xs text-slate-400 font-mono font-light">Asset Unavailable</span>
      </div>
    );
  }

  const isPdf = Boolean(
    src.toLowerCase().endsWith(".pdf") ||
      src.toLowerCase().includes(".pdf?") ||
      src.startsWith("data:application/pdf")
  );

  const isVideo = Boolean(
    src.match(/\.(mp4|webm|mov|ogg|mkv|avi)$/i) ||
      src.includes("/video/") ||
      src.startsWith("data:video/")
  );

  // --- FULL VIEW / CERTIFICATE MODAL RENDERING (Images & PDFs with Complete Digital Rights Lockdown) ---
  if (isFullView) {
    if (isPdf) {
      return (
        <div className="relative flex flex-col w-full h-full select-none">
          <PdfCanvasViewer src={src} alt={alt} />
          <div className="pt-3 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Verified Credential: {alt}</span>
            </span>

            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 select-none">
              🔒 In-Browser Vector Protected
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        className="relative flex flex-col w-full h-full select-none"
      >
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-white/15 flex items-center justify-center p-2"
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-auto max-h-[82vh] object-contain rounded-lg select-none pointer-events-auto"
          />

          {/* Authenticated Holographic Overlay Watermark */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 pointer-events-none select-none flex items-center justify-center opacity-[0.06] overflow-hidden"
          >
            <div className="text-white text-base sm:text-2xl font-mono font-black tracking-widest -rotate-25 whitespace-nowrap uppercase select-none pointer-events-none">
              © MONU GUPTA • VERIFIED CREDENTIAL • UNAUTHORIZED REPRODUCTION PROHIBITED
            </div>
          </div>

          {/* Top Transparent Click & Context Shield: blocks right-click, Save As, while forwarding wheel scroll */}
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            onWheel={(e) => {
              const container = e.currentTarget.closest('[data-lenis-prevent="true"]') as HTMLElement | null;
              if (container) {
                container.scrollTop += e.deltaY;
              }
            }}
            className="absolute inset-0 z-20 pointer-events-auto bg-transparent select-none cursor-default"
          />
        </div>

        <div className="pt-3 flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Verified Credential: {alt}</span>
          </span>

          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 select-none">
            🔒 Protected Digital Credential
          </span>
        </div>
      </div>
    );
  }

  // Thumbnail / Preview for PDF
  if (isPdf) {
    return (
      <div
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        className={`flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950/80 border border-rose-500/20 select-none ${
          fill ? "absolute inset-0 w-full h-full" : "w-full h-full min-h-[120px]"
        }`}
      >
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-1.5 shadow-sm">
          <FileText className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-semibold text-white truncate max-w-[90%] font-mono">
          {alt || "PDF Certificate"}
        </span>
        <span className="text-[9px] font-mono text-rose-300 mt-0.5 uppercase tracking-wider">
          PDF Document
        </span>
      </div>
    );
  }


  // --- VIDEO RENDERING (Protected Player with Persistent Memory Caching) ---
  if (isVideo) {
    const isCached = videoCache.has(src);

    const markVideoLoaded = () => {
      if (src) videoCache.add(src);
      setIsVideoReady(true);
    };

    return (
      <div
        onClick={onClick}
        onContextMenu={(e) => e.preventDefault()}
        className={`overflow-hidden select-none bg-black/80 flex items-center justify-center relative ${fill ? "absolute inset-0 w-full h-full" : "relative w-full h-full"}`}
      >
        {/* Only show loader if video has NEVER buffered before and has no poster */}
        {!isVideoReady && !isCached && !poster && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs z-10 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-2 text-cyan-400 font-mono text-xs">
              <span className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] tracking-wider text-slate-400 uppercase">Streaming Asset...</span>
            </div>
          </div>
        )}

        {/* On mobile touch devices, optimize by showing poster and preloading none for grid cards to ensure 120fps native scroll */}
        <video
          key={src}
          poster={poster}
          preload={isFullView || controls ? "auto" : (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? "none" : "metadata")}
          autoPlay={typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches && !isFullView ? false : autoPlay}
          loop={loop}
          muted={muted}

          // @ts-ignore
          defaultMuted={muted}
          controls={controls}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          // @ts-ignore
          disableRemotePlayback
          playsInline={playsInline}
          onCanPlay={markVideoLoaded}
          onLoadedData={markVideoLoaded}
          onPlaying={markVideoLoaded}
          onContextMenu={(e) => e.preventDefault()}
          className={`${className} pointer-events-auto select-none w-full h-full object-contain transition-opacity duration-300 ${
            isVideoReady || isCached || poster ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
          Your browser does not support HTML5 video streaming.
        </video>
        {showBadge && !controls && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-300 flex items-center gap-1 pointer-events-none z-10">
            <Film className="h-2.5 w-2.5" />
            <span>VIDEO</span>
          </div>
        )}
      </div>
    );
  }




  // --- IMAGE RENDERING (JPG, PNG, WEBP, SVG, GIF, AVIF) ---
  const isDataOrSvg = Boolean(
    src.startsWith("data:") ||
      src.startsWith("blob:") ||
      src.toLowerCase().endsWith(".svg") ||
      src.includes(".svg?")
  );

  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`overflow-hidden select-none ${fill ? "absolute inset-0 w-full h-full" : "relative w-full h-full"}`}
    >
      <Image
        src={src}
        alt={alt || "Media Showcase"}
        fill={fill}
        priority={priority}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 440px"}
        unoptimized={isDataOrSvg}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className={`${className} pointer-events-auto select-none`}
        loading={priority ? "eager" : "lazy"}
        onError={() => {
          setError(true);
        }}
      />
    </div>
  );
}


