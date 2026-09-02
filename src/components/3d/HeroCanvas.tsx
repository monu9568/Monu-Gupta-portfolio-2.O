"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import PersonalCube from "./PersonalCube";
import LiquidEnvironment from "./LiquidEnvironment";

interface HeroCanvasProps {
  cubeImages?: {
    front?: string;
    right?: string;
    back?: string;
    left?: string;
    top?: string;
    bottom?: string;
  };
}

export function CanvasFallback() {
  return (
    <div className="relative h-[460px] lg:h-[560px] w-full flex items-center justify-center pointer-events-none select-none">
      <div className="relative h-44 w-44 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-glass flex items-center justify-center">
        <div className="h-20 w-20 rounded-2xl border border-cyan-400/20 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 flex items-center justify-center">
          <span className="h-3 w-3 rounded-full bg-cyan-400/60 animate-ping" />
        </div>
      </div>
    </div>
  );
}

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("Hero WebGL canvas notice:", error);
  }
  render() {
    if (this.state.hasError) {
      return <CanvasFallback />;
    }
    return this.props.children;
  }
}

export default function HeroCanvas({ cubeImages }: HeroCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) {
    return <CanvasFallback />;
  }

  return (
    <CanvasErrorBoundary>
      <div className="relative h-[460px] lg:h-[560px] w-full flex items-center justify-center">
        <Canvas
          camera={{ position: [0, 0, isMobile ? 6.5 : 5.8], fov: 45 }}
          dpr={isMobile ? [1, 1.25] : [1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          className="h-full w-full"
        >
          <Suspense fallback={null}>
            <LiquidEnvironment isMobile={isMobile} />
            <PersonalCube
              frontImg={cubeImages?.front || "/images/personal/cube-front.webp"}
              rightImg={cubeImages?.right || "/images/personal/cube-creative.webp"}
              backImg={cubeImages?.back || "/images/personal/cube-lifestyle.webp"}
              leftImg={cubeImages?.left || "/images/personal/cube-code.webp"}
              topImg={cubeImages?.top || "/images/personal/cube-studio.webp"}
              bottomImg={cubeImages?.bottom || "/images/personal/cube-front.webp"}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}

