"use client";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { INK, M } from "./materials";
import { Box } from "./Box";

export function Gem() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 2;
    ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  return (
    <mesh ref={ref} material={M.gem} castShadow>
      <octahedronGeometry args={[0.3]} />
      <Edges color={INK} />
    </mesh>
  );
}

export function Goal({ open }: { open: boolean }) {
  const beam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (beam.current)
      (beam.current.material as THREE.MeshBasicMaterial).opacity =
        (open ? 0.3 : 0.14) + Math.sin(clock.elapsedTime * 4) * 0.08;
  });
  return (
    <group>
      <Box size={[0.7, 0.42, 0.52]} pos={[0, 0.21, 0]} material={M.chest} />
      <Box size={[0.74, 0.18, 0.56]} pos={[0, 0.5, 0]} material={M.chest} />
      <Box size={[0.14, 0.2, 0.06]} pos={[0, 0.38, 0.28]} material={M.gold} />
      {
        <mesh ref={beam} position={[0, 1.6, 0]} material={M.beam}>
          <cylinderGeometry args={[0.45, 0.45, 3, 12, 1, true]} />
        </mesh>
      }
    </group>
  );
}
