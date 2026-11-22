"use client";
import { useState } from "react";
import { type StepKind, type World } from "@/lib/levels";
import { WorldEvent } from "./types";
import { KeyItem } from "./TileParts";
import { Tile } from "./Tile";
import { Gem, Goal } from "./Treasure";
import { CuboModel } from "./CuboModel";
import { MobModel } from "./MobModel";
import { BURST_COLORS, Burst, type BurstDef } from "./Burst";
import { Fit } from "./Fit";
import { Lights } from "./Lights";

/** Contenu de la scène 3D : cases, objets, monstres, Cubo et explosions. */
export function Scene({ world, event }: { world: World; event: WorldEvent }) {
  const cx = (world.w - 1) / 2;
  const cz = (world.h - 1) / 2;
  const [bursts, setBursts] = useState<BurstDef[]>([]);
  const [seen, setSeen] = useState(event.key);

  // Nouvel événement (gemme, rocher…) : on ajoute une explosion à l'endroit où il a eu lieu.
  const color = BURST_COLORS[event.kind as StepKind];
  if (event.key !== seen) {
    setSeen(event.key);
    const at = event.at ?? { x: world.cubo.x, y: world.cubo.y };
    if (color)
      setBursts((b) => [
        ...b,
        {
          id: event.key,
          x: at.x - cx,
          z: at.y - cz,
          y: event.kind === "splash" || event.kind === "burn" ? -0.2 : 0.5,
          color,
          n: event.kind === "win" ? 30 : 16,
        },
      ]);
  }

  return (
    <>
      <Fit w={world.w} h={world.h} />
      <Lights />
      {world.tiles.map((row, y) =>
        row.map((t, x) => (
          <group key={`${x},${y}`} position={[x - cx, 0, y - cz]}>
            <Tile
              t={t}
              x={x}
              y={y}
              horizontal={
                (row[x - 1] ?? "T") !== "T" || (row[x + 1] ?? "T") !== "T"
              }
            />
            {world.gems.includes(`${x},${y}`) && <Gem />}
            {world.keys.includes(`${x},${y}`) && <KeyItem />}
            {world.goal.x === x && world.goal.y === y && (
              <Goal open={world.gems.length === 0} />
            )}
          </group>
        )),
      )}
      {world.mobs.map((m) => (
        <MobModel key={m.id} mob={m} cx={cx} cz={cz} />
      ))}
      <CuboModel world={world} event={event} cx={cx} cz={cz} />
      {bursts.map((b) => (
        <Burst
          key={b.id}
          def={b}
          onDone={(id) => setBursts((l) => l.filter((x) => x.id !== id))}
        />
      ))}
    </>
  );
}
