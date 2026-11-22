"use client";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { INK, M, ACC } from "./materials";
import { Box } from "./Box";

/** Accessoire de dos en 3D (le dos du cube est en z = -0.32). */
export function Back3D({ id }: { id: string }) {
  const flame = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (flame.current)
      flame.current.scale.y = 0.8 + Math.sin(clock.elapsedTime * 20) * 0.25;
  });
  switch (id) {
    case "rien":
      return null;
    case "cape":
      return (
        <mesh
          position={[0, -0.04, -0.37]}
          rotation={[0.18, 0, 0]}
          material={ACC.cape}
          castShadow
        >
          <boxGeometry args={[0.6, 0.66, 0.04]} />
          <Edges color={INK} />
        </mesh>
      );
    case "ailes":
      return (
        <group position={[0, 0.1, -0.36]}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh
                position={[s * 0.3, 0.1, 0]}
                rotation={[0, s * 0.5, s * 0.5]}
                material={ACC.wingA}
              >
                <boxGeometry args={[0.42, 0.3, 0.03]} />
                <Edges color={INK} />
              </mesh>
              <mesh
                position={[s * 0.26, -0.18, 0]}
                rotation={[0, s * 0.5, -s * 0.4]}
                material={ACC.wingB}
              >
                <boxGeometry args={[0.3, 0.22, 0.03]} />
                <Edges color={INK} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "carapace":
      return (
        <group position={[0, 0.02, -0.38]}>
          <Box size={[0.58, 0.58, 0.14]} pos={[0, 0, 0]} material={ACC.shell} />
          <Box
            size={[0.26, 0.26, 0.06]}
            pos={[0, 0, -0.09]}
            material={ACC.shell2}
            edges={false}
          />
        </group>
      );
    case "jetpack":
      return (
        <group position={[0, 0.02, -0.42]}>
          {[-0.12, 0.12].map((x) => (
            <group key={x}>
              <mesh position={[x, 0, 0]} material={ACC.metal} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.44, 12]} />
                <Edges color={INK} threshold={30} />
              </mesh>
              <group ref={x < 0 ? flame : undefined} position={[x, -0.28, 0]}>
                <mesh rotation={[Math.PI, 0, 0]} material={ACC.flame}>
                  <coneGeometry args={[0.07, 0.18, 8]} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      );
    default:
      return (
        <Box
          size={[0.42, 0.42, 0.16]}
          pos={[0, 0.02, -0.38]}
          material={M.pack}
        />
      );
  }
}
