"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { Info } from "lucide-react";
import World2D from "@/_components/game/World2D";
import { buildWorld, type Course } from "@/lib/levels";
import { useDismiss } from "@/hooks/useDismiss";
import { NewBlocksPopup } from "./NewBlocksPopup";

/** Aperçu du niveau phare + bouton latéral qui ouvre la liste des nouveaux blocs. */
export function CoursePreview({
  course,
  open,
  onToggle,
  onClose,
}: {
  course: Course;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const level = course.levels[course.preview - 1];
  const world = buildWorld(level);

  useDismiss(open, box, onClose);

  return (
    <div ref={box} className="pointer-events-none relative">
      <div
        className="relative h-52 overflow-hidden rounded-2xl border-[3px] border-ink"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 p-3"
          aria-hidden="true"
        >
          <World2D world={world} />
        </div>
        <span className="absolute bottom-2 left-2 rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-xs font-extrabold">
          Niveau {level.id} : {level.title}
        </span>
        <span className="sr-only">
          Aperçu du niveau {level.id} : {level.title}
        </span>
      </div>

      {/* Bouton « i » dans le coin bas droit */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Voir les nouveaux blocs de ${course.title}`}
        title="Nouveaux blocs"
        className="pointer-events-auto absolute right-2 bottom-2 z-10 grid size-9 place-items-center rounded-full border-[3px] border-ink shadow-pop"
        style={{ background: course.color }}
      >
        <Info size={20} strokeWidth={3} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {open && <NewBlocksPopup course={course} onClose={onClose} />}
      </AnimatePresence>
    </div>
  );
}
