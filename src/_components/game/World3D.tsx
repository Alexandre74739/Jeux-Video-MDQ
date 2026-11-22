"use client";
import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import type { World } from "@/lib/levels";
import { GLBoundary } from "./world3d/GLBoundary";
import { Scene } from "./world3d/Scene";
import type { WorldEvent } from "./world3d/types";

export type { WorldEvent };

/** Monde du niveau en 3D (three.js). Si WebGL n'est pas disponible, on affiche `fallback` (la vue 2D). */
export default function World3D({
  world,
  event,
  fallback,
}: {
  world: World;
  event: WorldEvent;
  fallback: ReactNode;
}) {
  return (
    <GLBoundary fallback={fallback}>
      <Canvas
        shadows
        orthographic
        dpr={[1, 2]}
        camera={{ position: [10, 15, 12], zoom: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        aria-label="Monde de Cubo en 3D"
        role="img"
      >
        <Scene world={world} event={event} />
      </Canvas>
    </GLBoundary>
  );
}
