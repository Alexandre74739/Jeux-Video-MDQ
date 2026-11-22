"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { M, HAT } from "./materials";
import { Box } from "./Box";
import { HAT_MODELS } from "./hatModels";

function Propeller() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 9;
  });
  return (
    <group ref={ref} position={[0, 0.66, 0]}>
      <Box size={[0.56, 0.03, 0.1]} pos={[0, 0, 0]} material={M.yellow} />
      <Box size={[0.1, 0.03, 0.56]} pos={[0, 0, 0]} material={HAT.blue} />
    </group>
  );
}

/** Chapeau de Cubo en 3D (le haut du corps est à y = 0.32). */
export function Hat3D({ id }: { id: string }) {
  if (HAT_MODELS[id]) return HAT_MODELS[id];
  switch (id) {
    case "aucun":
      return null;
    case "helice":
      return (
        <group>
          <Box size={[0.5, 0.1, 0.5]} pos={[0, 0.37, 0]} material={HAT.red} />
          <Box
            size={[0.3, 0.06, 0.18]}
            pos={[0, 0.34, 0.32]}
            material={HAT.red}
          />
          <Box
            size={[0.05, 0.24, 0.05]}
            pos={[0, 0.52, 0]}
            material={M.black}
            edges={false}
          />
          <Propeller />
        </group>
      );
    case "pirate":
      return (
        <group>
          <Box size={[0.82, 0.18, 0.3]} pos={[0, 0.42, 0]} material={M.black} />
          <Box size={[0.5, 0.16, 0.26]} pos={[0, 0.58, 0]} material={M.black} />
          <Box
            size={[0.12, 0.12, 0.03]}
            pos={[0, 0.5, 0.16]}
            material={M.white}
            edges={false}
          />
        </group>
      );
    default:
      return (
        <group>
          <Box size={[0.5, 0.1, 0.5]} pos={[0, 0.37, 0]} material={M.cap} />
          <Box
            size={[0.3, 0.06, 0.18]}
            pos={[0, 0.34, 0.32]}
            material={M.cap}
          />
        </group>
      );
  }
}
