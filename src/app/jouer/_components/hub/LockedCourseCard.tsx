"use client";
import { motion } from "motion/react";
import { Lock, Map as MapIcon } from "lucide-react";
import { StarIcon } from "@/_components/icons/Icon";
import type { Course, WorldLock } from "@/lib/levels";
import { ICON_STROKE } from "@/lib/site";

/** Carte d'un monde secret encore fermé : morceaux de carte et étoiles qu'il reste à trouver. */
export function LockedCourseCard({
  course,
  lock,
  index,
}: {
  course: Course;
  lock: WorldLock;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[30px] border-[3px] border-dashed border-ink bg-paper/70 p-8 text-center"
    >
      <span className="grid size-16 place-items-center rounded-full border-[3px] border-ink bg-cream">
        <Lock size={30} strokeWidth={ICON_STROKE} aria-hidden="true" />
      </span>
      <h2 className="text-3xl font-bold">{course.title}</h2>
      <p className="font-bold text-ink-soft">
        Un monde secret… Complète la carte au trésor et allume le phare avec{" "}
        {lock.need} étoiles pour le découvrir !
      </p>
      <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-display text-xl font-bold">
        <span className="flex items-center gap-1">
          <MapIcon size={22} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          {lock.pieces} / 4<span className="sr-only"> morceaux de carte</span>
        </span>
        <span className="flex items-center gap-1">
          <StarIcon size={22} /> {Math.min(lock.have, lock.need)} / {lock.need}
          <span className="sr-only"> étoiles</span>
        </span>
      </p>
    </motion.article>
  );
}
