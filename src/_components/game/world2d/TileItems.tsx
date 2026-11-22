"use client";
import { motion } from "motion/react";
import { C } from "./colors";

/** Objets posés sur une case : clé, coffre (qui brille une fois ouvert) et gemme. */
export function TileItems({
  hasKey,
  goal,
  gem,
  open,
}: {
  hasKey: boolean;
  goal: boolean;
  gem: boolean;
  open: boolean;
}) {
  return (
    <>
      {hasKey && (
        <motion.div
          className="absolute inset-[24%]"
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <svg viewBox="0 0 40 40" className="size-full" aria-hidden="true">
            <circle
              cx="13"
              cy="13"
              r="8"
              fill="#FFD23F"
              stroke="#16123A"
              strokeWidth="4"
            />
            <path
              d="M19 19 L34 34 M27 27 L22 32 M31 31 L27 35"
              stroke="#16123A"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      )}
      {goal && (
        <motion.div
          className="absolute inset-[16%] rounded-[16%] border-[3px] border-ink"
          style={{ background: C.chest }}
          animate={{
            boxShadow: open
              ? ["0 0 0 0 #FFD23F", "0 0 0 8px #FFD23F00"]
              : "0 0 0 0 #0000",
          }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <div
            className="absolute inset-x-0 top-[38%] h-[16%] border-y-2 border-ink"
            style={{ background: C.gold }}
          />
          <div
            className="absolute top-[32%] left-[40%] h-[30%] w-[20%] rounded-sm border-2 border-ink"
            style={{ background: C.gold }}
          />
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
    </>
  );
}
