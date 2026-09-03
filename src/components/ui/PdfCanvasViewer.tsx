"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, ShieldCheck, Eye, Sparkles } from "lucide-react";

interface PdfCanvasViewerProps {
  src: string;
  alt?: string;
  className?: string;
  isTouchScreen?: boolean;
}

export default function PdfCanvasViewer({
  src,
  alt = "Verified Credential",
  className = "",
  isTouchScreen = false,
}: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasLoadedPdfJs, setHasLoadedPdfJs] = useState(false);

  // Load PDF.js from trusted CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).pdfjsLib) {
      setHasLoadedPdfJs(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setHasLoadedPdfJs(true);
      }
    };
    script.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, []);

  // Render PDF pages onto HTML5 Canvas
  useEffect(() => {
    if (!hasLoadedPdfJs || !src || typeof window === "undefined") return;

    let isCancelled = false;
    setIsLoading(true);
    setError(false);

    const renderPdf = async () => {
      try {
        const pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) return;

        const loadingTask = pdfjs.getDocument({
          url: src,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        const page = await pdf.getPage(1);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { willReadFrequently: false });
        if (!context) return;

        // Dynamic Retina / High-DPI Display Scaling for razor-sharp vector rendering
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
        const baseViewport = page.getViewport({ scale: 1.0 });

        // Fit width to container (or standard certificate width)
        const containerWidth = containerRef.current?.clientWidth || 800;
        const targetScale = (containerWidth / baseViewport.width) * pixelRatio;
        const viewport = page.getViewport({ scale: targetScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        if (!isCancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("PDF Canvas render warning:", err);
        if (!isCancelled) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      isCancelled = true;
    };
  }, [hasLoadedPdfJs, src]);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/15 flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-24 px-6 flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-xs">
          <span className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 tracking-wider uppercase text-[11px]">
            Decrypting & Rendering Vector Credential...
          </span>
        </div>
      )}

      {/* Fallback iframe if PDF.js is blocked by strict network firewall */}
      {error && (
        <iframe
          src={`${src}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          title={alt}
          className="w-full min-h-[620px] sm:min-h-[820px] border-0 select-none"
        />
      )}

      {/* High-Resolution HTML5 Canvas Document */}
      <div
        className={`relative w-full flex items-center justify-center transition-all duration-300 ${
          isLoading ? "hidden" : "block"
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-w-full rounded-xl object-contain select-none pointer-events-auto shadow-2xl"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Holographic Security DRM Stamp permanently fused over canvas */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none select-none flex items-center justify-center opacity-[0.065] overflow-hidden"
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
    </div>
  );
}
