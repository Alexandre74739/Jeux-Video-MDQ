"use client";
import { motion } from "motion/react";
import { C } from "./colors";

/** Dessin d'une case : chemin, herbe, arbre, eau, pont, lave, rocher, porte ou fleurs. */
export function TileArt({
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
  const alt = (x + y) % 2 === 0;
  if (t === "L") {
    return (
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: ["#FF6A1F", "#FF8A3D", "#FF6A1F"] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
      >
        <span className="absolute top-[25%] left-[20%] size-[16%] rounded-full bg-sun" />
        <span className="absolute top-[60%] left-[60%] size-[12%] rounded-full bg-sun" />
      </motion.div>
    );
  }
  if (t === "W" || t === "B") {
    return (
      <div className="absolute inset-0" style={{ background: C.water }}>
        <span className="absolute top-[30%] left-[15%] h-[8%] w-[35%] rounded-full bg-white/50" />
        <span className="absolute top-[62%] left-[50%] h-[8%] w-[30%] rounded-full bg-white/40" />
        {t === "B" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-x-0 inset-y-[7%] border-y-[3px] border-ink"
            style={{
              background: `repeating-linear-gradient(90deg, ${C.plank} 0 30%, ${C.trunk} 30% 34%)`,
            }}
          />
        )}
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{ background: t === "T" ? C.grassDark : alt ? C.path : C.path2 }}
    >
      {t === "T" && (
        <div
          className="absolute inset-[14%] rounded-[18%] border-[3px] border-ink"
          style={{
            background: (x * 7 + y * 3) % 2 ? C.leaf : C.leaf2,
            boxShadow: "3px 4px 0 rgba(22,18,58,.35)",
          }}
        >
          <div className="absolute inset-[22%] rounded-[18%] bg-white/20" />
        </div>
      )}
      {(t === "D" || t === "O") && (
        <div
          className={`absolute ${horizontal ? "inset-y-[6%] left-[38%] w-[24%]" : "inset-x-[6%] top-[38%] h-[24%]"} rounded-md border-[3px] border-ink`}
          style={{
            background: t === "D" ? "#A0612E" : "transparent",
            borderStyle: t === "O" ? "dashed" : "solid",
          }}
        >
          {t === "D" && (
            <span className="absolute top-1/2 left-1/2 size-[40%] max-h-3 max-w-3 -translate-1/2 rounded-full border-2 border-ink bg-sun" />
          )}
        </div>
      )}
      {t === "R" && (
        <div
          className="absolute inset-[13%] rounded-[22%] border-[3px] border-ink"
          style={{
            background: C.rock,
            boxShadow: "3px 4px 0 rgba(22,18,58,.35)",
          }}
        >
          <div className="absolute top-[18%] left-[18%] h-[22%] w-[30%] rounded-full bg-white/50" />
        </div>
      )}
      {t === "f" && (
        <>
          <span className="absolute top-[22%] left-[22%] size-[13%] border-2 border-ink bg-coral" />
          <span className="absolute top-[55%] left-[62%] size-[13%] border-2 border-ink bg-sun" />
          <span className="absolute top-[70%] left-[35%] size-[13%] border-2 border-ink bg-white" />
        </>
      )}
    </div>
  );
}
