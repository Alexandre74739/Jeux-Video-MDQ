"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { M } from "./materials";
import { Box } from "./Box";

export function Lava() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(() => M.lava.clone(), []);
  useFrame(({ clock }) => {
    const m = ref.current?.material as THREE.MeshPhongMaterial | undefined;
    if (m) m.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 3) * 0.35;
  });
  return (
    <group>
      <Box
        size={[1, 1, 1]}
        pos={[0, -0.6, 0]}
        material={M.lavaRock}
        edges={false}
      />
      <mesh ref={ref} position={[0, -0.12, 0]} material={material}>
        <boxGeometry args={[0.98, 0.06, 0.98]} />
      </mesh>
    </group>
  );
}

/** Porte en bois : fermée (D) ou ouverte (O). horizontal = le chemin passe d'ouest en est. */
export function Door({
  open,
  horizontal,
}: {
  open: boolean;
  horizontal: boolean;
}) {
  const leaf = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (leaf.current)
      leaf.current.rotation.y = THREE.MathUtils.damp(
        leaf.current.rotation.y,
        open ? -Math.PI / 2 : 0,
        6,
        dt,
      );
  });
  return (
    <group rotation={[0, horizontal ? Math.PI / 2 : 0, 0]}>
      <Box size={[0.14, 1.05, 0.2]} pos={[-0.43, 0.52, 0]} material={M.post} />
      <Box size={[0.14, 1.05, 0.2]} pos={[0.43, 0.52, 0]} material={M.post} />
      <Box size={[1, 0.16, 0.22]} pos={[0, 1.1, 0]} material={M.post} />
      <group ref={leaf} position={[-0.36, 0, 0]}>
        <Box size={[0.72, 0.95, 0.1]} pos={[0.36, 0.48, 0]} material={M.door} />
        <Box size={[0.12, 0.16, 0.14]} pos={[0.58, 0.5, 0]} material={M.gold} />
      </group>
    </group>
  );
}

export function KeyItem() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 2.2;
    ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  return (
    <group ref={ref}>
      <mesh material={M.gold} castShadow position={[0, 0.12, 0]}>
        <torusGeometry args={[0.13, 0.05, 8, 16]} />
      </mesh>
      <Box size={[0.07, 0.32, 0.07]} pos={[0, -0.12, 0]} material={M.gold} />
      <Box
        size={[0.12, 0.05, 0.07]}
        pos={[0.07, -0.22, 0]}
        material={M.gold}
        edges={false}
      />
      <Box
        size={[0.1, 0.05, 0.07]}
        pos={[0.06, -0.12, 0]}
        material={M.gold}
        edges={false}
      />
    </group>
  );
}
