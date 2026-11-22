"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { trailOf } from "@/lib/rewards";
import { trailGeometry, trailMaterials } from "./trailLook";

const TRAIL_N = 36;
/** Traînée de particules derrière Cubo quand il se déplace (dans le repère de son parent). */
export function Trail({
  target,
  kind,
}: {
  target: React.RefObject<THREE.Group | null>;
  kind: string;
}) {
  const def = trailOf(kind);
  const mats = useMemo(() => trailMaterials(def.colors, kind), [def, kind]);
  const geo = useMemo(() => trailGeometry(kind), [kind]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useRef(
    Array.from({ length: TRAIL_N }, () => ({
      life: 0,
      p: new THREE.Vector3(),
      v: new THREE.Vector3(),
    })),
  );
  const last = useRef<THREE.Vector3 | null>(null);
  const acc = useRef(0);
  const next = useRef(0);
  useFrame((_, dt) => {
    const g = target.current;
    if (!g || !mats.length) return;
    const pos = g.position;
    if (!last.current) last.current = pos.clone();
    const moved = last.current.distanceTo(pos);
    last.current.copy(pos);
    // Pas de traînée lors d'un saut de position (réinitialisation du niveau)
    if (moved < 1) acc.current += moved;
    while (acc.current > 0.09) {
      acc.current -= 0.09;
      const pt = parts.current[next.current];
      next.current = (next.current + 1) % TRAIL_N;
      pt.life = 1;
      pt.p.set(
        pos.x + (Math.random() - 0.5) * 0.3,
        0.15 + Math.random() * 0.4,
        pos.z + (Math.random() - 0.5) * 0.3,
      );
      const up =
        kind === "flammes"
          ? 1.6
          : kind === "bulles"
            ? 0.7
            : kind === "paillettes"
              ? -0.2
              : 0.4;
      pt.v.set((Math.random() - 0.5) * 0.4, up, (Math.random() - 0.5) * 0.4);
    }
    parts.current.forEach((pt, i) => {
      const m = meshes.current[i];
      if (!m) return;
      if (pt.life <= 0) {
        m.visible = false;
        return;
      }
      pt.life -= dt * (kind === "flammes" ? 1.8 : 1.1);
      pt.p.addScaledVector(pt.v, dt);
      m.visible = pt.life > 0;
      m.position.copy(pt.p);
      m.scale.setScalar(Math.max(0.01, pt.life));
      m.rotation.y += dt * 4;
    });
  });
  if (!mats.length) return null;
  return (
    <>
      {Array.from({ length: TRAIL_N }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={geo}
          material={mats[i % mats.length]}
          visible={false}
        />
      ))}
    </>
  );
}
