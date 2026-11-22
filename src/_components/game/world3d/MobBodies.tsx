"use client";
import { Edges } from "@react-three/drei";
import { INK, M, MOB } from "./materials";
import { Box, Details, type Detail } from "./Box";

const GLOUPS_FACE: Detail[] = [
  [[0.14, 0.14, 0.04], [-0.14, 0.36, 0.31], M.white],
  [[0.14, 0.14, 0.04], [0.14, 0.36, 0.31], M.white],
  [[0.07, 0.07, 0.03], [-0.12, 0.34, 0.335], M.black],
  [[0.07, 0.07, 0.03], [0.16, 0.34, 0.335], M.black],
  [[0.2, 0.05, 0.03], [0, 0.18, 0.315], M.black],
];

const GROGNON_FACE: Detail[] = [
  [[0.13, 0.13, 0.04], [-0.13, 0.34, 0.26], M.white],
  [[0.13, 0.13, 0.04], [0.13, 0.34, 0.26], M.white],
  [[0.06, 0.06, 0.03], [-0.12, 0.33, 0.285], M.black],
  [[0.06, 0.06, 0.03], [0.14, 0.33, 0.285], M.black],
  // sourcils froncés et bouche
  [[0.14, 0.035, 0.03], [-0.13, 0.43, 0.27], M.black],
  [[0.14, 0.035, 0.03], [0.13, 0.43, 0.27], M.black],
  [[0.22, 0.05, 0.03], [0, 0.16, 0.26], M.black],
];

/** Gloups : cube gluant translucide avec un cœur vert. */
export function GloupsBody() {
  return (
    <>
      <Box
        size={[0.3, 0.3, 0.3]}
        pos={[0, 0.27, 0]}
        material={MOB.slimeCore}
        edges={false}
      />
      <Box size={[0.6, 0.56, 0.6]} pos={[0, 0.28, 0]} material={MOB.slime} />
      <Details parts={GLOUPS_FACE} />
    </>
  );
}

/** Grognon : cube violet à cornes, l'air fâché. */
export function GrognonBody() {
  return (
    <>
      <Box size={[0.56, 0.5, 0.5]} pos={[0, 0.27, 0]} material={MOB.grognon} />
      <Box
        size={[0.4, 0.12, 0.4]}
        pos={[0, 0.02, 0]}
        material={MOB.grognonDark}
        edges={false}
      />
      {[-0.18, 0.18].map((x) => (
        <mesh
          key={x}
          position={[x, 0.62, 0]}
          rotation={[0, 0, x < 0 ? 0.35 : -0.35]}
          material={MOB.horn}
        >
          <coneGeometry args={[0.07, 0.24, 6]} />
          <Edges color={INK} threshold={30} />
        </mesh>
      ))}
      <Details parts={GROGNON_FACE} />
    </>
  );
}
