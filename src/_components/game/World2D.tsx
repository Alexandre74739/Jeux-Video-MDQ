"use client";
import { AnimatePresence, motion } from "motion/react";
import type { World } from "@/lib/levels";
import { CuboTop } from "./world2d/CuboTop";
import { MobArt } from "./world2d/MobArt";
import { TileArt } from "./world2d/TileArt";
import { TileItems } from "./world2d/TileItems";

/* Vue de dessus fidèle au monde 3D : mêmes couleurs, mêmes objets, même Cubo. */
export default function World2D({ world }: { world: World }) {
  const size = `min(${96 / world.w}cqw, ${94 / world.h}cqh)`;
  const open = world.gems.length === 0;
  return (
    <div
      className="grid h-full w-full place-items-center px-2 pt-12 pb-4"
      style={{ containerType: "size" }}
    >
      <div
        className="relative overflow-hidden rounded-xl border-[3px] border-ink"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${world.w}, ${size})`,
          boxShadow: "0 8px 0 0 #9C6A3C, 0 8px 0 3px #16123A",
        }}
      >
        {world.tiles.flatMap((row, y) =>
          row.map((t, x) => {
            const gem = world.gems.includes(`${x},${y}`);
            const goal = world.goal.x === x && world.goal.y === y;
            return (
              <div
                key={`${x},${y}`}
                className="relative"
                style={{
                  width: size,
                  height: size,
                  boxShadow: "inset 0 0 0 1px rgba(22,18,58,.18)",
                }}
              >
                <TileArt
                  t={t}
                  x={x}
                  y={y}
                  horizontal={
                    (row[x - 1] ?? "T") !== "T" || (row[x + 1] ?? "T") !== "T"
                  }
                />
                <TileItems
                  hasKey={world.keys.includes(`${x},${y}`)}
                  goal={goal}
                  gem={gem}
                  open={open}
                />
              </div>
            );
          }),
        )}

        <AnimatePresence>
          {world.mobs.map((m) => (
            <motion.div
              key={m.id}
              className="pointer-events-none absolute top-0 left-0"
              initial={false}
              animate={{
                x: `calc(${size} * ${m.x})`,
                y: `calc(${size} * ${m.y})`,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{ width: size, height: size }}
            >
              <MobArt mob={m} />
            </motion.div>
          ))}
        </AnimatePresence>

        <CuboTop cubo={world.cubo} size={size} />
      </div>
    </div>
  );
}
