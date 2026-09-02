"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Film, FileText, Image as ImageIcon, ExternalLink, Download } from "lucide-react";

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

export default function SmartMedia({
  src,
  alt,
  className = "w-full h-full object-cover",
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
  showBadge = false,
  isFullView = false,
}: SmartMediaProps) {
  const [error, setError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  if (!src || error) {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-slate-900/80 text-slate-400 border border-white/10 ${
          fill ? "absolute inset-0 w-full h-full" : "w-full h-full min-h-[140px]"
        }`}
      >
        <ImageIcon className="h-7 w-7 stroke-1 mb-1 text-slate-500" />
        <span className="text-[11px] font-mono text-center px-2">{alt || "No Media"}</span>
      </div>
    );
  }

  const isPdf = Boolean(
    src.toLowerCase().endsWith(".pdf") ||
      src.includes(".pdf?") ||
      src.includes("/pdf/") ||
      src.startsWith("data:application/pdf")
  );

  const isVideo = Boolean(
    src.match(/\.(mp4|webm|mov|ogg|mkv|avi)$/i) ||
      src.includes("/video/") ||
      src.startsWith("data:video/")
  );

  // --- PDF RENDERING (Protected Embedded Viewer with Complete Right-Click Lockdown) ---
  if (isPdf) {
    if (isFullView || controls) {
      return (
        <div
          onClick={onClick}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          className={`relative flex flex-col w-full h-full select-none ${fill ? "absolute inset-0" : "min-h-[480px]"}`}
        >
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            className="relative flex-1 w-full h-full min-h-[420px] rounded-xl overflow-hidden bg-slate-950 border border-white/15"
          >
            <iframe
              src={`${src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title={alt}
              className="w-full h-full min-h-[420px] border-0 pointer-events-auto select-none"
            />
            {/* Top Transparent Click Shield to block right click Save As */}
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              className="absolute inset-0 z-10 pointer-events-none bg-transparent"
            />
          </div>
          <div className="pt-3 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Verified Credential: {alt}</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Protected Document Preview
            </span>
          </div>
        </div>
      );
    }

    // Thumbnail / Preview for PDF
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

  // --- VIDEO RENDERING (Protected Player with Instant Buffer State) ---
  if (isVideo) {
    return (
      <div
        onClick={onClick}
        onContextMenu={(e) => e.preventDefault()}
        className={`overflow-hidden select-none bg-black/80 flex items-center justify-center relative ${fill ? "absolute inset-0 w-full h-full" : "relative w-full h-full"}`}
      >
        {/* Sleek Animated Pulse Skeleton while Video Buffers */}
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs z-10 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-2 text-cyan-400 font-mono text-xs">
              <span className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] tracking-wider text-slate-400 uppercase">Streaming Asset...</span>
            </div>
          </div>
        )}

        <video
          key={src}
          poster={poster}
          preload="auto"
          autoPlay={autoPlay}
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
          onCanPlay={() => setIsVideoReady(true)}
          onLoadedData={() => setIsVideoReady(true)}
          onContextMenu={(e) => e.preventDefault()}
          className={`${className} pointer-events-auto select-none w-full h-full object-contain transition-opacity duration-500 ${
            isVideoReady ? "opacity-100" : "opacity-0"
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


