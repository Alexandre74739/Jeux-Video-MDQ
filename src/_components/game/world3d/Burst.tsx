"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { StepKind } from "@/lib/levels";
import { mat } from "./materials";

export type BurstDef = {
  id: number;
  x: number;
  z: number;
  y: number;
  color: string;
  n: number;
};

/** Couleur de l'explosion selon l'événement (pas d'explosion pour les autres). */
export const BURST_COLORS: Partial<Record<StepKind, string>> = {
  collect: "#36E2F5",
  hit: "#9B7BFF",
  caught: "#7BD88F",
  break: "#A5ADC0",
  bridge: "#D69A5B",
  splash: "#3FA9F5",
  win: "#FFD23F",
  key: "#FFD23F",
  open: "#A0612E",
  burn: "#FF6A1F",
};

/** Morceaux de l'explosion, lancés au hasard vers le haut depuis le point d'impact. */
function spawn(def: BurstDef) {
  return Array.from({ length: def.n }, () => ({
    v: new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      2.5 + Math.random() * 3,
      (Math.random() - 0.5) * 4,
    ),
    p: new THREE.Vector3(def.x, def.y, def.z),
  }));
}

/** Petite explosion de cubes colorés (gemme ramassée, rocher cassé, victoire…). */
export function Burst({
  def,
  onDone,
}: {
  def: BurstDef;
  onDone: (id: number) => void;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useMemo(() => spawn(def), [def]);
  const life = useRef(0);
  const material = useMemo(() => mat(def.color), [def.color]);
  useFrame((_, dt) => {
    life.current += dt;
    parts.forEach((pt, i) => {
      pt.v.y -= 9 * dt;
      pt.p.addScaledVector(pt.v, dt);
      const m = refs.current[i];
      if (m) {
        m.position.copy(pt.p);
        m.scale.setScalar(Math.max(0, 1 - life.current));
        m.rotation.x += dt * 6;
      }
    });
    if (life.current > 1) onDone(def.id);
  });
  return (
    <>
      {parts.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          material={material}
        >
          <boxGeometry args={[0.12, 0.12, 0.12]} />
        </mesh>
      ))}
    </>
  );
}
