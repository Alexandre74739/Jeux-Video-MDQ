"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { CuboBody, Trail } from "./World3D";
import type { Outfit } from "@/lib/rewards";

/** Cubo qui fait des petits tours sur son île, pour montrer sa tenue et sa traînée. */
function Walker({ outfit }: { outfit: Outfit }) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.9;
    const g = ref.current;
    if (!g || !body.current) return;
    g.position.set(Math.sin(t) * 1.1, 0, Math.cos(t) * 0.7);
    g.rotation.y = t + Math.PI / 2;
    body.current.position.y = 0.33 + Math.abs(Math.sin(clock.elapsedTime * 6)) * 0.12;
  });
  return (
    <>
      <Trail target={ref} kind={outfit.trail} />
      <group ref={ref}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 20]} />
          <meshBasicMaterial color="#16123A" transparent opacity={0.2} />
        </mesh>
        <group ref={body}><CuboBody outfit={outfit} /></group>
      </group>
    </>
  );
}

export default function CuboPreview3D({ outfit, fallback }: { outfit: Outfit; fallback: ReactNode }) {
  if (typeof window !== "undefined" && !window.WebGLRenderingContext) return <>{fallback}</>;
  return (
    <Canvas orthographic dpr={[1, 2]} camera={{ position: [6, 6, 8], zoom: 105, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }} aria-label="Cubo avec sa tenue" role="img"
      onCreated={({ camera }) => camera.lookAt(0, 0.3, 0)}>
      <ambientLight intensity={1.6} />
      <hemisphereLight args={["#ffffff", "#7ED957", 0.8]} />
      <directionalLight position={[6, 12, 5]} intensity={2.2} />
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[2, 2.1, 1, 32]} />
        <meshLambertMaterial color="#7ED957" flatShading />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[2.1, 1.6, 0.4, 32]} />
        <meshLambertMaterial color="#9C6A3C" flatShading />
      </mesh>
      <Walker outfit={outfit} />
    </Canvas>
  );
}
