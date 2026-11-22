"use client";
import { AnimatePresence, motion } from "motion/react";
import { Flame, Trophy } from "lucide-react";
import { BumpNumber } from "@/_components/animations/BumpNumber";
import { StarIcon } from "@/_components/icons/Icon";
import { BADGES, type Progress } from "@/lib/rewards";
import { ICON_STROKE } from "@/lib/site";

const chip =
  "toon flex items-center rounded-full px-3 py-1.5 font-display text-lg font-bold";

/** Étoiles du parcours, série de réussites du jour (flamme) et badges gagnés. */
export function ScoreChips({
  stars,
  streak,
  progress,
}: {
  stars: number;
  streak: number;
  progress: Progress;
}) {
  const badgeNames = Object.entries(BADGES)
    .filter(([k]) => progress.badges.includes(k))
    .map(([, b]) => b.name)
    .join(", ");
  return (
    <>
      <div className={`${chip} gap-1.5 bg-sun`} title="Étoiles gagnées">
        <StarIcon size={22} />
        <BumpNumber value={stars} />
        <span className="sr-only">étoiles</span>
      </div>
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`${chip} gap-1 bg-orange`}
            title="Niveaux réussis aujourd'hui. Se tromper n'efface rien !"
          >
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              aria-hidden="true"
            >
              <Flame size={22} strokeWidth={ICON_STROKE} fill="#FFD23F" />
            </motion.span>
            <BumpNumber value={streak} />
            <span className="sr-only">niveaux réussis aujourd'hui</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`${chip} gap-1.5 bg-lilac`}
        title={badgeNames || "Aucun badge pour l'instant"}
      >
        <Trophy size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <BumpNumber value={progress.badges.length} />
        <span className="sr-only">badges</span>
      </div>
    </>
  );
}
