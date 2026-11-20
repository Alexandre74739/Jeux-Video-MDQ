"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Palette, Puzzle, Sparkles, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useRef } from "react";
import World2D from "./World2D";
import InstallButton from "./InstallButton";
import BackButton from "./BackButton";
import { Cubo, Logo, SoundToggle } from "./ui";
import { Icon, StarIcon } from "./Icon";
import { BlockView } from "./BlockView";
import { createBlock } from "@/lib/blocks";
import { BLOCKS } from "@/lib/blocks";
import { COURSES, DIFFICULTY, buildWorld, type Course } from "@/lib/levels";
import { BADGES, emptyProgress, load, type Progress } from "@/lib/storage";
import { sfx } from "@/lib/sound";

function DifficultyMeter({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-2" aria-label={`Difficulté : ${DIFFICULTY[level]}, ${level} sur 4`}>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-4 w-3 rounded-sm border-2 border-ink ${i <= level ? "bg-ink" : "bg-paper"}`} style={{ height: 8 + i * 3 }} />
        ))}
      </span>
      <span className="font-display text-base font-bold">{DIFFICULTY[level]}</span>
    </span>
  );
}

/** Aperçu du niveau phare + bouton latéral qui ouvre la liste des nouveaux blocs. */
function CoursePreview({ course, open, onToggle, onClose }: { course: Course; open: boolean; onToggle: () => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const level = course.levels[course.preview - 1];
  const world = buildWorld(level);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) onClose(); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); };
  }, [open, onClose]);

  return (
    <div ref={box} className="relative">
      <div
        className="relative h-52 overflow-hidden rounded-2xl border-[3px] border-ink"
        style={{ background: "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 p-3 pr-14" aria-hidden="true">
          <World2D world={world} />
        </div>
        <span className="absolute bottom-2 left-2 rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-xs font-extrabold">
          Niveau {level.id} : {level.title}
        </span>
        <span className="sr-only">Aperçu du niveau {level.id} : {level.title}</span>
      </div>

      {/* Bouton sur le côté */}
      <motion.button
        whileHover={{ x: -3 }} whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Voir les nouveaux blocs de ${course.title}`}
        className="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border-[3px] border-ink px-1.5 py-2.5 font-display text-xs font-bold shadow-pop"
        style={{ background: course.color }}
      >
        <Puzzle size={20} strokeWidth={2.75} aria-hidden="true" />
        <span className="[writing-mode:vertical-rl] rotate-180">Blocs</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            role="dialog" aria-label={`Nouveaux blocs de ${course.title}`}
            className="absolute top-1/2 right-14 z-20 w-[min(300px,calc(100%-4rem))] origin-right -translate-y-1/2 rounded-3xl border-[3px] border-ink bg-paper p-4 shadow-pop-lg"
          >
            <button onClick={onClose} className="absolute top-2 right-2 grid size-8 place-items-center rounded-full hover:bg-cream" aria-label="Fermer">
              <X size={18} strokeWidth={3} aria-hidden="true" />
            </button>
            <p className="pr-8 text-sm font-extrabold tracking-wide text-ink-soft uppercase">Nouveaux blocs</p>
            <div className="mt-2 flex flex-col gap-2">
              {course.newBlocks.map((t) => <BlockView key={t} block={createBlock(t)} mode="static" />)}
            </div>
            <p className="mt-3 text-sm font-bold text-ink-soft">
              {course.newBlocks.map((t) => BLOCKS[t].label.replace(/[{][a-z]+[}]/g, "…")).join(", ")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CourseHub() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  useEffect(() => setProgress(load<Progress>("progress", emptyProgress)), []);

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <BackButton fallback="/" />
            <Logo small />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block"><InstallButton /></span>
            <Link href="/creer/" className="btn flex items-center gap-2 whitespace-nowrap bg-pink px-4 py-2">
              <Palette size={20} strokeWidth={2.75} aria-hidden="true" /> <span className="hidden sm:inline">Création libre</span>
            </Link>
            <SoundToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Cubo size={96} mood="wow" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold sm:text-5xl">Choisis ton défi !</h1>
            <p className="mt-1 text-lg font-semibold text-ink-soft">
              Commence par le tutoriel, puis attaque des défis de plus en plus durs. Chaque défi a ses nouveaux blocs.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {COURSES.map((c, i) => {
            const done = c.levels.filter((l) => progress.stars[`${c.slug}:${l.id}`]).length;
            const stars = c.levels.reduce((a, l) => a + (progress.stars[`${c.slug}:${l.id}`] ?? 0), 0);
            const max = c.levels.length * 3;
            const label = done === c.levels.length ? "Rejouer" : done > 0 ? "Continuer" : "Commencer";
            return (
              <motion.article
                key={c.slug}
                initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 140, damping: 16 }}
                whileHover={{ y: -6 }}
                className="relative flex flex-col overflow-hidden rounded-[30px] border-[3px] border-ink bg-paper"
                style={{ boxShadow: "8px 9px 0 0 #16123A" }}
              >
                {i === 0 && (
                  <motion.span
                    animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="toon absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-sun px-3 py-1 font-display text-sm font-bold"
                  >
                    <Sparkles size={15} strokeWidth={2.75} aria-hidden="true" /> Commence ici !
                  </motion.span>
                )}
                <div className="border-b-[3px] border-ink px-6 pt-5 pb-4" style={{ background: c.color }}>
                  <DifficultyMeter level={c.difficulty} />
                  <h2 className="mt-2 text-3xl font-bold">{c.title}</h2>
                  <p className="font-bold">{c.subtitle}</p>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <CoursePreview course={c} open={openInfo === c.slug} onToggle={() => { setOpenInfo(openInfo === c.slug ? null : c.slug); sfx("click"); }} onClose={() => setOpenInfo(null)} />
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm font-extrabold">
                      <span className="flex items-center gap-1">
                        {done === c.levels.length ? <Check size={16} strokeWidth={3.5} aria-hidden="true" /> : null}
                        {done} / {c.levels.length} niveaux
                      </span>
                      <span className="flex items-center gap-1"><StarIcon size={16} /> {stars} / {max}</span>
                    </div>
                    <div className="mt-1.5 h-4 overflow-hidden rounded-full border-[3px] border-ink bg-cream" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={stars} aria-label={`Étoiles : ${stars} sur ${max}`}>
                      <motion.div className="h-full bg-sun" initial={{ width: 0 }} animate={{ width: `${(stars / max) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} />
                    </div>
                  </div>
                  <Link
                    href={`/jouer/${c.slug}/`}
                    onClick={() => sfx("click")}
                    className="btn flex items-center justify-center gap-2 py-3 text-xl"
                    style={{ background: c.color }}
                  >
                    {label} <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        <section className="toon mt-12 rounded-[30px] bg-paper p-6">
          <h2 className="text-2xl font-bold">Mes badges</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(BADGES).map(([k, b]) => {
              const got = progress.badges.includes(k);
              return (
                <li key={k} className={`flex items-center gap-3 rounded-2xl border-[3px] p-3 ${got ? "border-ink bg-lilac" : "border-ink/20 bg-cream"}`}>
                  <span className={`grid size-12 shrink-0 place-items-center rounded-full border-[3px] ${got ? "border-ink bg-sun" : "border-ink/25 text-ink/35"}`}>
                    <Icon name={b.icon} size={24} />
                  </span>
                  <span>
                    <span className={`block font-display text-lg font-bold ${got ? "" : "text-ink-soft"}`}>{b.name}</span>
                    <span className="text-sm font-bold text-ink-soft">{got ? b.text : "À débloquer…"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
