"use client";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { StarIcon } from "@/_components/icons/Icon";

/** Niveaux réussis et barre des étoiles gagnées dans un parcours. */
export function CourseProgress({
  done,
  count,
  stars,
  index,
}: {
  done: number;
  count: number;
  stars: number;
  index: number;
}) {
  const max = count * 3;
  return (
    <div className="mt-auto">
      <div className="flex items-center justify-between text-sm font-extrabold">
        <span className="flex items-center gap-1">
          {done === count && (
            <Check size={16} strokeWidth={3.5} aria-hidden="true" />
          )}
          {done} / {count} niveaux
        </span>
        <span className="flex items-center gap-1">
          <StarIcon size={16} /> {stars} / {max}
        </span>
      </div>
      <div
        className="mt-1.5 h-4 overflow-hidden rounded-full border-[3px] border-ink bg-cream"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={stars}
        aria-label={`Étoiles : ${stars} sur ${max}`}
      >
        <motion.div
          className="h-full bg-sun"
          initial={{ width: 0 }}
          animate={{ width: `${(stars / max) * 100}%` }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
        />
      </div>
    </div>
  );
}
