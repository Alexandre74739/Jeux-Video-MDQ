"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BLOCKS, createBlock, type Block } from "@/lib/blocks";
import { ICON_STROKE } from "@/lib/site";
import { BlockView } from "../BlockView";
import type { SpriteOpt } from "../block/types";
import { PaletteTabs } from "./PaletteTabs";
import type { Group } from "./types";

/** Palette des blocs disponibles. Pendant un glisser, elle sert de poubelle. */
export function Palette({
  groups,
  dragging,
  overTrash,
  disabled,
  sprites,
  spriteDefault,
  onAdd,
  onGrab,
}: {
  groups: Group[];
  dragging: boolean;
  overTrash: boolean;
  disabled?: boolean;
  sprites?: SpriteOpt[];
  spriteDefault: string;
  onAdd: (b: Block) => void;
  onGrab: (e: React.PointerEvent, b: Block) => void;
}) {
  const [tab, setTab] = useState(groups[0].category);
  const showTabs = groups.length > 1;
  const visible = showTabs ? groups.filter((g) => g.category === tab) : groups;
  const make = (type: string) => createBlock(type, spriteDefault);
  return (
    <section
      data-trash={dragging ? "1" : undefined}
      aria-label="Blocs disponibles"
      className={`relative flex w-full max-h-[280px] md:max-h-none ${showTabs ? "md:w-[320px]" : "md:w-[250px]"} shrink-0 flex-col overflow-hidden rounded-3xl border-[3px] border-ink shadow-pop transition-colors ${overTrash ? "bg-coral/30" : "bg-paper"}`}
    >
      <h2 className="border-b-[3px] border-ink bg-sky px-4 py-2 text-lg font-bold">
        Blocs
      </h2>
      <div className="flex min-h-0 flex-1">
        {showTabs && <PaletteTabs groups={groups} tab={tab} onTab={setTab} />}
        <div className="scroll-soft flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3">
          {visible
            .flatMap((g) => g.types)
            .map((type) => (
              <motion.div
                key={type}
                whileHover={{ scale: 1.04, rotate: -1.5 }}
                whileTap={{ scale: 0.95 }}
                className="w-fit"
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={`Ajouter le bloc ${BLOCKS[type].label.replace(/\{\w+\}/g, "…")}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAdd(make(type));
                  }
                }}
              >
                <BlockView
                  block={make(type)}
                  mode="palette"
                  sprites={sprites}
                  onPointerDown={(e) => onGrab(e, make(type))}
                />
              </motion.div>
            ))}
        </div>
      </div>
      <AnimatePresence>
        {overTrash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-none absolute inset-0 grid place-items-center text-center font-display text-xl font-bold"
          >
            <span className="flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink bg-coral px-4 py-3 shadow-pop">
              <Trash2 size={30} strokeWidth={ICON_STROKE} aria-hidden="true" />
              Lâche pour
              <br />
              jeter
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
