"use client";
import { motion } from "motion/react";
import type { World } from "@/lib/levels";

/* Vue de dessus fidèle au monde 3D : mêmes couleurs, mêmes objets, même Cubo. */
const C = {
  ink: "#16123A",
  path: "#F4E2AE",
  path2: "#EAD596",
  grassDark: "#4FB548",
  leaf: "#3FAE4A",
  leaf2: "#56C25A",
  water: "#3FA9F5",
  plank: "#D69A5B",
  trunk: "#8A5A2E",
  rock: "#A5ADC0",
  gem: "#36E2F5",
  chest: "#B5672D",
  gold: "#FFD23F",
  body: "#FF8A3D",
  cap: "#7BD88F",
};
const ANGLE = [0, 90, 180, 270]; // N, E, S, O

function TileArt({ t, x, y }: { t: string; x: number; y: number }) {
  const alt = (x + y) % 2 === 0;
  if (t === "W" || t === "B") {
    return (
      <div className="absolute inset-0" style={{ background: C.water }}>
        <span className="absolute top-[30%] left-[15%] h-[8%] w-[35%] rounded-full bg-white/50" />
        <span className="absolute top-[62%] left-[50%] h-[8%] w-[30%] rounded-full bg-white/40" />
        {t === "B" && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute inset-x-0 inset-y-[7%] border-y-[3px] border-ink"
            style={{ background: `repeating-linear-gradient(90deg, ${C.plank} 0 30%, ${C.trunk} 30% 34%)` }}
          />
        )}
      </div>
    );
  }
  return (
    <div className="absolute inset-0" style={{ background: t === "T" ? C.grassDark : alt ? C.path : C.path2 }}>
      {t === "T" && (
        <div className="absolute inset-[14%] rounded-[18%] border-[3px] border-ink" style={{ background: (x * 7 + y * 3) % 2 ? C.leaf : C.leaf2, boxShadow: "3px 4px 0 rgba(22,18,58,.35)" }}>
          <div className="absolute inset-[22%] rounded-[18%] bg-white/20" />
        </div>
      )}
      {t === "R" && (
        <div className="absolute inset-[13%] rounded-[22%] border-[3px] border-ink" style={{ background: C.rock, boxShadow: "3px 4px 0 rgba(22,18,58,.35)" }}>
          <div className="absolute top-[18%] left-[18%] h-[22%] w-[30%] rounded-full bg-white/50" />
        </div>
      )}
      {t === "f" && (
        <>
          <span className="absolute top-[22%] left-[22%] size-[13%] border-2 border-ink bg-[#FF6B57]" />
          <span className="absolute top-[55%] left-[62%] size-[13%] border-2 border-ink bg-[#FFD23F]" />
          <span className="absolute top-[70%] left-[35%] size-[13%] border-2 border-ink bg-white" />
        </>
      )}
    </div>
  );
}

export default function World2D({ world }: { world: World }) {
  const size = `min(${90 / world.w}cqw, ${88 / world.h}cqh)`;
  const open = world.gems.length === 0;
  return (
    <div className="grid h-full w-full place-items-center" style={{ containerType: "size" }}>
      <div
        className="relative overflow-hidden rounded-xl border-[3px] border-ink"
        style={{ display: "grid", gridTemplateColumns: `repeat(${world.w}, ${size})`, boxShadow: "0 8px 0 0 #9C6A3C, 0 8px 0 3px #16123A" }}
      >
        {world.tiles.flatMap((row, y) =>
          row.map((t, x) => {
            const gem = world.gems.includes(`${x},${y}`);
            const goal = world.goal.x === x && world.goal.y === y;
            return (
              <div key={`${x},${y}`} className="relative" style={{ width: size, height: size, boxShadow: "inset 0 0 0 1px rgba(22,18,58,.18)" }}>
                <TileArt t={t} x={x} y={y} />
                {goal && (
                  <motion.div
                    className="absolute inset-[16%] rounded-[16%] border-[3px] border-ink"
                    style={{ background: C.chest }}
                    animate={{ boxShadow: open ? ["0 0 0 0 #FFD23F", "0 0 0 8px #FFD23F00"] : "0 0 0 0 #0000" }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <div className="absolute inset-x-0 top-[38%] h-[16%] border-y-2 border-ink" style={{ background: C.gold }} />
                    <div className="absolute top-[32%] left-[40%] h-[30%] w-[20%] rounded-sm border-2 border-ink" style={{ background: C.gold }} />
                  </motion.div>
                )}
                {gem && (
                  <motion.div
                    className="absolute inset-[28%] rotate-45 border-[3px] border-ink"
                    style={{ background: C.gem }}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                )}
              </div>
            );
          })
        )}

        {/* Cubo vu de dessus : corps orange, casquette verte, flèche jaune = direction */}
        <motion.div
          className="pointer-events-none absolute top-0 left-0"
          initial={false}
          animate={{ x: `calc(${size} * ${world.cubo.x})`, y: `calc(${size} * ${world.cubo.y})` }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ width: size, height: size }}
        >
          <motion.div className="relative size-full" initial={false} animate={{ rotate: ANGLE[world.cubo.dir] }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <svg viewBox="0 0 100 100" className="absolute -top-[42%] left-[30%] w-[40%] overflow-visible" aria-hidden="true">
              <path d="M50 8 L90 70 L10 70 Z" fill={C.gold} stroke={C.ink} strokeWidth="9" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-[16%] rounded-[18%] border-[3px] border-ink" style={{ background: C.body, boxShadow: "3px 4px 0 rgba(22,18,58,.35)" }}>
              <div className="absolute inset-x-[20%] top-[22%] bottom-[30%] rounded-md border-2 border-ink" style={{ background: C.cap }} />
              <span className="absolute top-[4%] left-[22%] size-[18%] rounded-full border-2 border-ink bg-white" />
              <span className="absolute top-[4%] right-[22%] size-[18%] rounded-full border-2 border-ink bg-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
