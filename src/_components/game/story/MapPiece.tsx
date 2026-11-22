"use client";
import { motion } from "motion/react";
import { DRAWINGS, INK } from "./mapDrawings";

/** Contour et position des 4 morceaux (2 × 2), qui s'emboîtent comme un puzzle. */
export const PIECES = [
  {
    x: 0,
    y: 0,
    d: "M0 0 H100 V48 Q92 56 100 64 V100 H64 Q56 92 48 100 H0 Z",
  },
  {
    x: 100,
    y: 0,
    d: "M100 0 H200 V100 H152 Q144 108 136 100 H100 V64 Q108 56 100 48 Z",
  },
  {
    x: 0,
    y: 100,
    d: "M0 100 H48 Q56 92 64 100 H100 V136 Q92 144 100 152 V200 H0 Z",
  },
  {
    x: 100,
    y: 100,
    d: "M100 100 H136 Q144 108 152 100 H200 V200 H100 V152 Q108 144 100 136 Z",
  },
];

/** Un morceau de la carte : dessiné s'il est trouvé, sinon un « ? » en pointillés. */
export function MapPiece({
  i,
  got,
  fresh,
}: {
  i: number;
  got: boolean;
  fresh: boolean;
}) {
  const p = PIECES[i];
  return got ? (
    <motion.g
      initial={fresh ? { scale: 0, rotate: -30, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        delay: 0.3,
        type: "spring",
        stiffness: 200,
        damping: 12,
      }}
      style={{ transformOrigin: `${p.x + 50}px ${p.y + 50}px` }}
    >
      <path
        d={p.d}
        fill="#F4E2AE"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g pointerEvents="none">{DRAWINGS[i]}</g>
    </motion.g>
  ) : (
    <>
      <path
        d={p.d}
        fill={INK}
        fillOpacity="0.06"
        stroke={INK}
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeDasharray="7 6"
      />
      <text
        x={p.x + 50}
        y={p.y + 62}
        textAnchor="middle"
        fontSize="34"
        fontWeight="800"
        fill={INK}
        opacity="0.3"
      >
        ?
      </text>
    </>
  );
}
