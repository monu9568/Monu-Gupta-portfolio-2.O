"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LiquidEnvironmentProps {
  isMobile?: boolean;
}

export default function LiquidEnvironment({ isMobile = false }: LiquidEnvironmentProps) {
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);
  const lightRef3 = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const count = isMobile ? 24 : 65;

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sca = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
      sca[i] = Math.random() * 0.08 + 0.02;
    }
    return [pos, sca];
  }, [count]);

  useFrame((state) => {
    // Only animate lights on desktop
    if (!isMobile) {
      const time = state.clock.getElapsedTime();

      // Orbiting soft specular lights
      if (lightRef1.current) {
        lightRef1.current.position.x = Math.sin(time * 0.7) * 4;
        lightRef1.current.position.y = Math.cos(time * 0.5) * 3;
        lightRef1.current.position.z = Math.sin(time * 0.3) * 2 + 3;
      }

      if (lightRef2.current) {
        lightRef2.current.position.x = Math.cos(time * 0.6) * 5;
        lightRef2.current.position.y = Math.sin(time * 0.8) * 3;
        lightRef2.current.position.z = Math.cos(time * 0.4) * 2 - 2;
      }

      if (lightRef3.current) {
        lightRef3.current.position.x = Math.sin(time * 0.4 + 2) * 3;
        lightRef3.current.position.y = -2;
        lightRef3.current.position.z = Math.cos(time * 0.5 + 1) * 3;
      }

      // Slow ambient rotation of particle field
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.02;
        particlesRef.current.rotation.x = Math.sin(time * 0.015) * 0.1;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 6]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-4, -3, -2]} intensity={0.8} color="#38bdf8" />
      <directionalLight position={[0, 4, -4]} intensity={0.6} color="#818cf8" />

      {/* Orbiting Volumetric Studio Point Lights */}
      <pointLight ref={lightRef1} intensity={3.2} distance={12} color="#38bdf8" />
      <pointLight ref={lightRef2} intensity={2.8} distance={14} color="#a78bfa" />
      <pointLight ref={lightRef3} intensity={2.0} distance={10} color="#f8fafc" />

      {/* Floating Refractive Particle Cloud */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.05 : 0.08}
          color="#93c5fd"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}
