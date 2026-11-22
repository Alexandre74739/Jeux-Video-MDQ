"use client";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { BlockView } from "@/_components/game/BlockView";
import { BLOCKS, createBlock } from "@/lib/blocks";
import type { Course } from "@/lib/levels";

/** Bulle qui montre les nouveaux blocs d'un parcours. */
export function NewBlocksPopup({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      role="dialog"
      aria-label={`Nouveaux blocs de ${course.title}`}
      className="pointer-events-auto absolute right-2 bottom-14 z-20 w-[min(300px,calc(100%-1rem))] origin-bottom-right rounded-3xl border-[3px] border-ink bg-paper p-4 shadow-pop-lg"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full hover:bg-cream"
        aria-label="Fermer"
      >
        <X size={18} strokeWidth={3} aria-hidden="true" />
      </button>
      <p className="pr-8 text-sm font-extrabold tracking-wide text-ink-soft uppercase">
        Nouveaux blocs
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {course.newBlocks.map((t) => (
          <BlockView key={t} block={createBlock(t)} mode="static" />
        ))}
        {course.newBlocks.length === 0 && (
          <p className="font-bold">Aucun : tu les connais déjà tous !</p>
        )}
      </div>
      <p className="mt-3 text-sm font-bold text-ink-soft">
        {course.newBlocks
          .map((t) => BLOCKS[t].label.replace(/[{][a-z]+[}]/g, "…"))
          .join(", ")}
      </p>
    </motion.div>
  );
}
