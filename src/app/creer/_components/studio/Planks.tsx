"use client";
import { motion } from "motion/react";
import type { Runtime } from "@/lib/runtime";

/** Ponts posés par les personnages pendant la partie. */
export function Planks({ rt, scale }: { rt: Runtime; scale: number }) {
  return rt.planks.map((pl, i) => (
    <motion.span
      key={i}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute rounded-md border-[3px] border-ink"
      style={{
        left: (pl.x - (pl.horizontal ? 24 : 14)) * scale,
        top: (pl.y - (pl.horizontal ? 14 : 24)) * scale,
        width: (pl.horizontal ? 48 : 28) * scale,
        height: (pl.horizontal ? 28 : 48) * scale,
        background: `repeating-linear-gradient(${pl.horizontal ? 90 : 0}deg, #D69A5B 0 10px, #8A5A2E 10px 12px)`,
      }}
      aria-hidden="true"
    />
  ));
}
