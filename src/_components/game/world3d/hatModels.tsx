"use client";
import { Edges } from "@react-three/drei";
import { INK, M, HAT } from "./materials";
import { Box } from "./Box";

/** Chapeaux de Cubo en 3D faits de cônes et de cylindres (sorcier, cowboy, couronne, corne de licorne). */
export const HAT_MODELS: Record<string, React.ReactElement> = {
  sorcier: (
    <group>
      <mesh position={[0, 0.35, 0]} material={HAT.purpleDark} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.04, 20]} />
        <Edges color={INK} threshold={20} />
      </mesh>
      <mesh
        position={[0, 0.68, 0]}
        rotation={[0.12, 0, 0]}
        material={HAT.purple}
        castShadow
      >
        <coneGeometry args={[0.27, 0.66, 12]} />
        <Edges color={INK} threshold={30} />
      </mesh>
      <Box
        size={[0.1, 0.1, 0.03]}
        pos={[0, 0.56, 0.2]}
        material={M.yellow}
        edges={false}
      />
    </group>
  ),
  cowboy: (
    <group>
      <mesh position={[0, 0.35, 0]} material={HAT.brown} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 20]} />
        <Edges color={INK} threshold={20} />
      </mesh>
      <mesh position={[0, 0.49, 0]} material={HAT.brownLight} castShadow>
        <cylinderGeometry args={[0.23, 0.27, 0.26, 16]} />
        <Edges color={INK} threshold={20} />
      </mesh>
      <mesh position={[0, 0.41, 0]} material={HAT.brownDark}>
        <cylinderGeometry args={[0.275, 0.275, 0.06, 16]} />
      </mesh>
    </group>
  ),
  couronne: (
    <group>
      <mesh position={[0, 0.43, 0]} material={M.gold} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 10, 1, true]} />
        <Edges color={INK} threshold={20} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => {
        const a = (k / 5) * Math.PI * 2;
        return (
          <mesh
            key={k}
            position={[Math.sin(a) * 0.25, 0.6, Math.cos(a) * 0.25]}
            material={M.gold}
          >
            <coneGeometry args={[0.07, 0.16, 6]} />
          </mesh>
        );
      })}
      <Box
        size={[0.08, 0.08, 0.03]}
        pos={[0, 0.43, 0.285]}
        material={M.red}
        edges={false}
      />
    </group>
  ),
  licorne: (
    <group position={[0, 0.5, 0.12]} rotation={[0.4, 0, 0]}>
      <mesh material={HAT.horn} castShadow>
        <coneGeometry args={[0.09, 0.5, 10]} />
        <Edges color={INK} threshold={30} />
      </mesh>
      <mesh position={[0, -0.08, 0]} material={HAT.pink}>
        <torusGeometry args={[0.07, 0.018, 6, 12]} />
      </mesh>
    </group>
  ),
};
