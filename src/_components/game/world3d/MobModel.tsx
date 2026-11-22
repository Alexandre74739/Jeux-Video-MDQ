"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { type Mob } from "@/lib/levels";
import { ANGLE, INK } from "./materials";
import { GloupsBody, GrognonBody } from "./MobBodies";

/** Gloups : cube gluant qui rebondit (on peut le battre). Grognon : cube violet à cornes qui se dandine (à esquiver). */
export function MobModel({
  mob,
  cx,
  cz,
}: {
  mob: Mob;
  cx: number;
  cz: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const first = useRef(true);
  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const tx = mob.x - cx;
    const tz = mob.y - cz;
    if (first.current) {
      g.position.set(tx, 0, tz);
      g.rotation.y = ANGLE[mob.dir];
      first.current = false;
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 9, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 9, dt);
    const diff =
      ((((ANGLE[mob.dir] - g.rotation.y + Math.PI) % (Math.PI * 2)) +
        Math.PI * 2) %
        (Math.PI * 2)) -
      Math.PI;
    g.rotation.y += diff * Math.min(1, dt * 10);
    const b = body.current;
    if (b) {
      const t = clock.elapsedTime * (mob.kind === "gloups" ? 6 : 5) + mob.id;
      b.position.y = mob.kind === "gloups" ? Math.abs(Math.sin(t)) * 0.18 : 0;
      b.rotation.z = mob.kind === "grognon" ? Math.sin(t) * 0.15 : 0;
      if (mob.kind === "gloups") {
        const k = Math.sin(t * 2) * 0.05;
        b.scale.set(1 + k, 1 - k, 1 + k);
      }
    }
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 20]} />
        <meshBasicMaterial color={INK} transparent opacity={0.2} />
      </mesh>
      <group ref={body}>
        {mob.kind === "gloups" ? <GloupsBody /> : <GrognonBody />}
      </group>
    </group>
  );
}
