"use client";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { StarIcon } from "@/_components/icons/Icon";
import type { LevelGameState } from "./useLevelGame";

/** Pastilles des niveaux du parcours : en cours, réussis (étoiles), ouverts ou verrouillés. */
export function LevelNav({ g }: { g: LevelGameState }) {
  return (
    <nav
      aria-label="Niveaux"
      className="order-last flex w-full items-center overflow-x-auto px-1 pt-1 pb-3 lg:order-0 lg:mx-auto lg:w-auto lg:overflow-visible lg:p-0"
    >
      {g.levels.map((l, i) => {
        const st = g.progress.stars[g.sk(l.id)] ?? 0;
        const open = g.unlocked(i);
        const cur = i === g.idx;
        return (
          <div key={l.id} className="flex items-center">
            {i > 0 && (
              <span
                className={`h-1.25 w-3 ${open ? "bg-ink" : "bg-ink/20"}`}
                aria-hidden="true"
              />
            )}
            <motion.button
              whileHover={open ? { y: -3 } : undefined}
              whileTap={open ? { scale: 0.9 } : undefined}
              animate={cur ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={cur ? { repeat: Infinity, duration: 1.6 } : undefined}
              onClick={() => g.goLevel(i)}
              aria-current={cur ? "step" : undefined}
              aria-label={`Niveau ${l.id}${open ? "" : " (verrouillé)"}${st ? `, ${st} étoile${st > 1 ? "s" : ""}` : ""}`}
              className={`relative grid size-11 place-items-center rounded-full border-[3px] border-ink font-display text-lg font-bold ${
                cur
                  ? "bg-grape text-white shadow-pop"
                  : st
                    ? "bg-mint shadow-pop"
                    : open
                      ? "bg-paper shadow-pop"
                      : "bg-[#E8E4F0] text-ink-soft"
              }`}
            >
              {open ? (
                l.id
              ) : (
                <Lock size={18} strokeWidth={3} aria-hidden="true" />
              )}
              {st > 0 && (
                <span
                  className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2"
                  aria-hidden="true"
                >
                  {Array.from({ length: st }, (_, k) => (
                    <StarIcon key={k} size={13} />
                  ))}
                </span>
              )}
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
}
