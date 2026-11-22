"use client";
import { motion } from "motion/react";
import type { World } from "@/lib/levels";
import { C } from "./colors";

const ANGLE = [0, 90, 180, 270]; // N, E, S, O

/** Cubo vu de dessus : corps orange, casquette verte, flèche jaune = direction. */
export function CuboTop({ cubo, size }: { cubo: World["cubo"]; size: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-0"
      initial={false}
      animate={{
        x: `calc(${size} * ${cubo.x})`,
        y: `calc(${size} * ${cubo.y})`,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="relative size-full"
        initial={false}
        animate={{ rotate: ANGLE[cubo.dir] }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute -top-[42%] left-[30%] w-[40%] overflow-visible"
          aria-hidden="true"
        >
          <path
            d="M50 8 L90 70 L10 70 Z"
            fill={C.gold}
            stroke={C.ink}
            strokeWidth="9"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className="absolute inset-[16%] rounded-[18%] border-[3px] border-ink"
          style={{
            background: C.body,
            boxShadow: "3px 4px 0 rgba(22,18,58,.35)",
          }}
        >
          <div
            className="absolute inset-x-[20%] top-[22%] bottom-[30%] rounded-md border-2 border-ink"
            style={{ background: C.cap }}
          />
          <span className="absolute top-[4%] left-[22%] size-[18%] rounded-full border-2 border-ink bg-white" />
          <span className="absolute top-[4%] right-[22%] size-[18%] rounded-full border-2 border-ink bg-white" />
        </div>
      </motion.div>
    </motion.div>
  );
}
