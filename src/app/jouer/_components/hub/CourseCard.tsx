"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { COURSES, type Course } from "@/lib/levels";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { CoursePreview } from "./CoursePreview";
import { CourseProgress } from "./CourseProgress";
import { DifficultyMeter } from "./DifficultyMeter";

/** Carte d'un parcours (toute la carte est cliquable) : difficulté, aperçu, progression, bouton. */
export function CourseCard({
  course: c,
  index: i,
  starsOf,
  infoOpen,
  onInfo,
}: {
  course: Course;
  index: number;
  starsOf: (key: string) => number;
  infoOpen: boolean;
  onInfo: (open: boolean) => void;
}) {
  const done = c.levels.filter((l) => starsOf(`${c.slug}:${l.id}`)).length;
  const stars = c.levels.reduce((a, l) => a + starsOf(`${c.slug}:${l.id}`), 0);
  const label =
    done === c.levels.length ? "Rejouer" : done > 0 ? "Continuer" : "Commencer";
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
      style={{
        boxShadow: "8px 9px 0 0 #16123A",
        zIndex: infoOpen ? 30 : undefined,
      }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{
        delay: i * 0.1,
        type: "spring",
        stiffness: 140,
        damping: 16,
      }}
      whileHover={{ y: -6 }}
      className="group relative flex cursor-pointer flex-col rounded-[30px] border-[3px] border-ink bg-paper focus-within:outline-4 focus-within:outline-offset-4 focus-within:outline-grape"
    >
      <Link
        href={`/jouer/${c.slug}/`}
        onClick={() => sfx("click")}
        className="absolute inset-0 z-0 rounded-[27px]"
        tabIndex={-1}
        aria-hidden="true"
      />
      {c.slug === COURSES[0].slug && (
        <motion.span
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="toon pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-sun px-3 py-1 font-display text-sm font-bold"
        >
          <Sparkles size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Commence ici !
        </motion.span>
      )}
      <div
        className="rounded-t-[27px] border-b-[3px] border-ink px-6 pt-5 pb-4"
        style={{ background: c.color }}
      >
        <DifficultyMeter level={c.difficulty} />
        <h2 className="mt-2 text-3xl font-bold">{c.title}</h2>
        <p className="font-bold">{c.subtitle}</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <CoursePreview
          course={c}
          open={infoOpen}
          onToggle={() => {
            onInfo(!infoOpen);
            sfx("click");
          }}
          onClose={() => onInfo(false)}
        />
        <CourseProgress
          done={done}
          count={c.levels.length}
          stars={stars}
          index={i}
        />
        <Link
          href={`/jouer/${c.slug}/`}
          onClick={() => sfx("click")}
          className="btn relative z-10 flex items-center justify-center gap-2 py-3 text-xl"
          aria-label={`${label} : ${c.title}`}
          style={{ background: c.color }}
        >
          {label} <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
