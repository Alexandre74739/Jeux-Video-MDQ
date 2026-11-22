"use client";
import { motion } from "motion/react";
import { BlockView } from "../BlockView";
import type { SpriteOpt } from "../block/types";
import type { DragState, Target } from "./types";

/** Bloc qui suit le pointeur pendant le glisser, et trait violet à l'endroit où il sera déposé. */
export function DragGhost({
  drag,
  target,
  overTrash,
  sprites,
}: {
  drag: DragState;
  target: Target | null;
  overTrash: boolean;
  sprites?: SpriteOpt[];
}) {
  return (
    <>
      <div
        className="pointer-events-none fixed z-50"
        style={{ left: drag.x - drag.ox, top: drag.y - drag.oy - drag.lift }}
      >
        <div
          style={{
            transform: "rotate(-3deg) scale(1.05)",
            filter: "drop-shadow(6px 8px 0 rgba(22,18,58,.35))",
            opacity: overTrash ? 0.5 : 1,
          }}
        >
          <BlockView block={drag.block} mode="static" sprites={sprites} />
        </div>
      </div>
      {target && (
        <motion.div
          layout
          className="pointer-events-none fixed z-40 h-2 rounded-full bg-grape"
          style={{
            top: target.top - 4,
            left: target.left,
            width: target.width,
            boxShadow: "0 0 0 3px #fff",
          }}
        />
      )}
    </>
  );
}
