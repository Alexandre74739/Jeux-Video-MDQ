"use client";
import { M, groundMats, hash } from "./materials";
import { Box, Details, PopIn, type Detail } from "./Box";
import { Lava, Door } from "./TileParts";

const BRIDGE_BEAMS: Detail[] = [
  [[0.08, 0.17, 0.86], [0.2, -0.11, 0], M.trunk],
  [[0.08, 0.17, 0.86], [-0.2, -0.11, 0], M.trunk],
];
const FLOWERS: Detail[] = [
  [[0.12, 0.12, 0.12], [-0.22, 0.06, -0.18], M.red],
  [[0.12, 0.12, 0.12], [0.2, 0.06, 0.1], M.yellow],
  [[0.12, 0.12, 0.12], [-0.05, 0.06, 0.26], M.white],
];

/** Une case du monde 3D : chemin, arbre, eau, pont, lave, porte, rocher ou fleurs. */
export function Tile({
  t,
  x,
  y,
  horizontal,
}: {
  t: string;
  x: number;
  y: number;
  horizontal: boolean;
}) {
  const h = hash(x, y);
  const alt = (x + y) % 2 === 0;
  if (t === "L") return <Lava />;
  if (t === "W" || t === "B") {
    return (
      <group>
        <Box
          size={[1, 0.7, 1]}
          pos={[0, -0.65, 0]}
          material={M.water}
          edges={false}
        />
        {t === "B" && (
          <PopIn>
            <Box
              size={[1, 0.16, 0.86]}
              pos={[0, -0.12, 0]}
              material={M.plank}
            />
            <Details parts={BRIDGE_BEAMS} />
          </PopIn>
        )}
      </group>
    );
  }
  return (
    <group>
      <Box
        size={[1, 1, 1]}
        pos={[0, -0.5, 0]}
        material={groundMats(t === "T", alt)}
      />
      {t === "T" && (
        <group>
          <Box size={[0.2, 0.26, 0.2]} pos={[0, 0.13, 0]} material={M.trunk} />
          <Box
            size={[0.66, 0.46, 0.66]}
            pos={[0, 0.48, 0]}
            material={h % 2 ? M.leaf : M.leaf2}
          />
        </group>
      )}
      {(t === "D" || t === "O") && (
        <Door open={t === "O"} horizontal={horizontal} />
      )}
      {t === "R" && (
        <Box
          size={[0.78, 0.62, 0.78]}
          pos={[0, 0.31, 0]}
          material={M.rock}
          rot={(h % 5) * 0.15}
        />
      )}
      {t === "f" && <Details parts={FLOWERS} />}
    </group>
  );
}
