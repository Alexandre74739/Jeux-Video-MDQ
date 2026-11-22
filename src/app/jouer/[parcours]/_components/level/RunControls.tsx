"use client";
import { motion } from "motion/react";
import { Hourglass, Play, Rabbit, RotateCcw, Turtle } from "lucide-react";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import type { LevelGameState } from "./useLevelGame";

const icon = {
  size: 24,
  strokeWidth: ICON_STROKE,
  "aria-hidden": true,
} as const;

/** Boutons sous le monde : lancer le programme, recommencer, vitesse lente ou rapide. */
export function RunControls({ g }: { g: LevelGameState }) {
  const { running, fast } = g;
  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={g.run}
        disabled={running}
        className="btn flex flex-1 items-center justify-center gap-2 bg-mint py-3 text-2xl"
      >
        {running ? (
          <>
            <Hourglass {...icon} /> En cours…
          </>
        ) : (
          <>
            <Play {...icon} fill="#16123A" /> Lancer
          </>
        )}
      </motion.button>
      <button
        onClick={() => {
          g.reset();
          sfx("click");
        }}
        className="btn bg-paper px-5 py-3"
        aria-label="Recommencer"
      >
        <RotateCcw size={24} strokeWidth={3} aria-hidden="true" />
      </button>
      <button
        onClick={() => {
          g.setFast(!fast);
          sfx("click");
        }}
        className={`btn px-4 py-3 ${fast ? "bg-orange" : "bg-paper"}`}
        aria-pressed={fast}
        aria-label={fast ? "Vitesse rapide" : "Vitesse normale"}
        title="Vitesse"
      >
        {fast ? <Rabbit {...icon} /> : <Turtle {...icon} />}
      </button>
    </div>
  );
}
