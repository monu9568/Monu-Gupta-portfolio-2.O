"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

interface PersonalCubeProps {
  frontImg?: string;
  rightImg?: string;
  backImg?: string;
  leftImg?: string;
  topImg?: string;
  bottomImg?: string;
  isMobile?: boolean;
}

export default function PersonalCube({
  frontImg = "/images/personal/cube-front.png",
  rightImg = "/images/personal/cube-creative.png",
  backImg = "/images/personal/cube-lifestyle.png",
  leftImg = "/images/personal/cube-code.png",
  topImg = "/images/personal/cube-studio.png",
  bottomImg = "/images/personal/cube-front.png",
  isMobile = false,
}: PersonalCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerCubeRef = useRef<THREE.Mesh>(null);
  const outerGlassRef = useRef<THREE.Mesh>(null);

  // Target rotation angles for inertia
  const targetRotation = useRef({ x: 0.1, y: 0.2 });
  const currentRotation = useRef({ x: 0.1, y: 0.2 });
  const touchStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const gyroOffset = useRef({ x: 0, y: 0 });

  // Initial instant default materials (0ms load time)
  const [materials, setMaterials] = useState<THREE.MeshStandardMaterial[]>(() =>
    Array.from({ length: 6 }, () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.1,
        metalness: 0.1,
        color: new THREE.Color("#0c1322"),
        emissive: new THREE.Color("#0369a1"),
        emissiveIntensity: 0.2,
      })
    )
  );

  // Non-blocking background texture streaming
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const urls = [
      rightImg || "/images/personal/cube-creative.webp",
      leftImg || "/images/personal/cube-code.webp",
      topImg || "/images/personal/cube-studio.webp",
      bottomImg || "/images/personal/cube-front.webp",
      frontImg || "/images/personal/cube-front.webp",
      backImg || "/images/personal/cube-lifestyle.webp",
    ];

    const loadedTextures: THREE.Texture[] = [];

    urls.forEach((url, index) => {
      loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.needsUpdate = true;
          loadedTextures.push(tex);

          setMaterials((prev) => {
            const next = [...prev];
            next[index] = new THREE.MeshStandardMaterial({
              map: tex,
              roughness: 0.1,
              metalness: 0.0,
              color: new THREE.Color("#ffffff"),
              emissive: new THREE.Color("#ffffff"),
              emissiveIntensity: 0.12,
            });
            return next;
          });
        },
        undefined,
        (err) => {
          console.warn("Could not load cube texture face", index, err);
        }
      );
    });

    return () => {
      loadedTextures.forEach((tex) => tex.dispose());
    };
  }, [rightImg, leftImg, topImg, bottomImg, frontImg, backImg]);

  // Desktop Mouse & Mobile Touch Interaction Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      // Map to subtle tilt & rotation range
      targetRotation.current.y = nx * 2.5;
      targetRotation.current.x = -ny * 1.9;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStart.current.x;
      const deltaY = e.touches[0].clientY - touchStart.current.y;
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      targetRotation.current.y += deltaX * 0.008;
      targetRotation.current.x += deltaY * 0.008;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        gyroOffset.current.y = (e.gamma / 45) * 0.5;
        gyroOffset.current.x = ((e.beta - 45) / 45) * 0.4;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [isMobile]);

  // Frame Render Loop with Smooth Spring Physics
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Constant slow luxury floating orbit
    const autoFloatY = isMobile ? time * 0.12 : Math.sin(time * 0.4) * 0.06;
    const autoFloatX = Math.cos(time * 0.35) * 0.04;

    // Smooth lerp damping towards target + gyro + float
    const desiredY = targetRotation.current.y + gyroOffset.current.y + autoFloatY;
    const desiredX = targetRotation.current.x + gyroOffset.current.x + autoFloatX;

    const lerpFactor = isMobile ? 0.08 : 0.05;
    currentRotation.current.x += (desiredX - currentRotation.current.x) * lerpFactor;
    currentRotation.current.y += (desiredY - currentRotation.current.y) * lerpFactor;

    groupRef.current.rotation.x = currentRotation.current.x;
    groupRef.current.rotation.y = currentRotation.current.y;

    // Gentle physical vertical breathing motion perfectly centered
    groupRef.current.position.y = Math.sin(time * 1.2) * 0.05;
  });

  const cubeSize = isMobile ? 1.6 : 1.9;

  return (
    <group ref={groupRef} position={[0.2, 0, 0]}>
      {/* Inner Image Cube with Monu Gupta's Full Uncut Portraits */}
      <mesh ref={innerCubeRef} material={materials}>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
      </mesh>

      {/* Floating Glowing Core Edges - Perfect contour on the cube perimeter */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)]} />
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.8} linewidth={1.5} />
      </lineSegments>

      {/* Outer Rounded Crystal Optical Glass Shell */}
      <RoundedBox
        ref={outerGlassRef as any}
        args={[cubeSize + 0.12, cubeSize + 0.12, cubeSize + 0.12]}
        radius={0.05}
        smoothness={isMobile ? 2 : 4}
      >
        {isMobile ? (
          <meshStandardMaterial
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.15}
            color={new THREE.Color("#e0f2fe")}
            emissive={new THREE.Color("#0284c7")}
            emissiveIntensity={0.15}
          />
        ) : (
          <meshPhysicalMaterial
            transparent
            transmission={0.92}
            opacity={1}
            roughness={0.03}
            ior={1.15}
            thickness={0.2}
            specularIntensity={1.0}
            specularColor={new THREE.Color("#ffffff")}
            color={new THREE.Color("#f0f9ff")}
            attenuationColor={new THREE.Color("#38bdf8")}
            attenuationDistance={3.0}
          />
        )}
      </RoundedBox>

      {/* Outer Specular Prism Orbit Wireframe */}
      <mesh>
        <octahedronGeometry args={[cubeSize * 1.08, 2]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}
