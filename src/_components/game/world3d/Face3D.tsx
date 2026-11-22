"use client";
import { M, ACC } from "./materials";
import { Box } from "./Box";

/** Accessoire du visage en 3D (yeux en x = ±0.14, y = 0.06, face avant en z = 0.32). */
export function Face3D({ id }: { id: string }) {
  switch (id) {
    case "lunettes":
      return (
        <group position={[0, 0.06, 0.36]}>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 0, 0]} material={M.black}>
              <torusGeometry args={[0.11, 0.022, 6, 16]} />
            </mesh>
          ))}
          <Box
            size={[0.08, 0.03, 0.03]}
            pos={[0, 0.02, 0]}
            material={M.black}
            edges={false}
          />
        </group>
      );
    case "soleil":
      return (
        <group position={[0, 0.06, 0.37]}>
          {[-0.14, 0.14].map((x) => (
            <Box
              key={x}
              size={[0.22, 0.16, 0.03]}
              pos={[x, 0, 0]}
              material={M.black}
              edges={false}
            />
          ))}
          <Box
            size={[0.08, 0.03, 0.03]}
            pos={[0, 0.03, 0]}
            material={M.black}
            edges={false}
          />
        </group>
      );
    case "monocle":
      return (
        <mesh position={[0.14, 0.06, 0.37]} material={ACC.gold}>
          <torusGeometry args={[0.12, 0.025, 6, 16]} />
        </mesh>
      );
    case "masque":
      return (
        <Box
          size={[0.66, 0.2, 0.02]}
          pos={[0, 0.06, 0.33]}
          material={ACC.purple}
          edges={false}
        />
      );
    default:
      return null;
  }
}
