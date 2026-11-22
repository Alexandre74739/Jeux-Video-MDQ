"use client";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { type World } from "@/lib/levels";
import { useOutfit } from "@/lib/outfit";
import { WorldEvent } from "./types";
import { INK, M, ARROW_GEO } from "./materials";
import { applyEvent, newMotion, stepCubo, type CuboMotion } from "./cuboMotion";
import { CuboBody } from "./CuboBody";
import { Trail } from "./Trail";

/** Cubo dans le monde 3D : il glisse de case en case, saute, se cogne, tombe à l'eau ou fête sa victoire. */
export function CuboModel({
  world,
  event,
  cx,
  cz,
}: {
  world: World;
  event: WorldEvent;
  cx: number;
  cz: number;
}) {
  const outfit = useOutfit();
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const motion = useRef<CuboMotion>(newMotion());

  useEffect(() => applyEvent(motion.current, event.kind), [event]);

  useFrame((_, dt) => {
    if (ref.current && body.current)
      stepCubo(
        motion.current,
        ref.current,
        body.current,
        world.cubo,
        cx,
        cz,
        dt,
      );
  });

  return (
    <>
      <Trail target={ref} kind={outfit.trail} />
      <group ref={ref}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 20]} />
          <meshBasicMaterial color={INK} transparent opacity={0.2} />
        </mesh>
        {/* Flèche au sol : indique où Cubo va avancer */}
        <mesh position={[0, 0.03, 0.4]} geometry={ARROW_GEO} material={M.arrow}>
          <Edges color={INK} />
        </mesh>
        <group ref={body}>
          <CuboBody outfit={outfit} />
        </group>
      </group>
    </>
  );
}
