"use client";

import React, { useRef, useState } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  glowOnHover?: boolean;
  tilt?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  elevated = false,
  glowOnHover = true,
  tilt = false,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });
  const [tiltStyle, setTiltStyle] = useState<{ transform: string }>({ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only execute 3D tilt calculations on desktop mouse environments to preserve 120fps mobile scroll
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y, active: true });

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`,
      });
    }
  };


  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
    if (tilt) {
      setTiltStyle({
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tilt ? tiltStyle : undefined}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        elevated ? "glass-panel-elevated" : "glass-panel"
      } ${className}`}
      {...props}
    >
      {/* Dynamic Specular Light Follower on Hover */}
      {glowOnHover && mousePos.active && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), transparent 80%)`,
          }}
        />
      )}

      {/* Top Specular Edge Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Inner Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
