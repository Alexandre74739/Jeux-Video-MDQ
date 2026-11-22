"use client";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { INK } from "./materials";

export function Box({
  size,
  pos,
  material,
  edges = true,
  rot,
}: {
  size: [number, number, number];
  pos: [number, number, number];
  material: THREE.Material | THREE.Material[];
  edges?: boolean;
  rot?: number;
}) {
  return (
    <mesh
      position={pos}
      rotation={[0, rot ?? 0, 0]}
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      {edges && <Edges color={INK} threshold={20} />}
    </mesh>
  );
}

export function PopIn({
  children,
  from = 0,
}: {
  children: ReactNode;
  from?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, 1, 10, dt);
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref} scale={from}>
      {children}
    </group>
  );
}

type V3 = [number, number, number];
/** Petit détail plat (œil, bouche…) : taille, position et matière. */
export type Detail = [size: V3, pos: V3, material: THREE.Material];

/** Détails sans contour, posés sur un modèle (yeux, sourcils, bouche…). */
export function Details({ parts }: { parts: Detail[] }) {
  return (
    <>
      {parts.map(([size, pos, material], i) => (
        <Box key={i} size={size} pos={pos} material={material} edges={false} />
      ))}
    </>
  );
}
