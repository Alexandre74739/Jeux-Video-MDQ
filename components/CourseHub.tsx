"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Palette, Sparkles } from "lucide-react";
import { Cubo, Logo, SoundToggle } from "./ui";
import { Icon, StarIcon } from "./Icon";
import { BlockView } from "./BlockView";
import { createBlock } from "@/lib/blocks";
import { COURSES, DIFFICULTY } from "@/lib/levels";
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

export default function CourseHub() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  useEffect(() => setProgress(load<Progress>("progress", emptyProgress)), []);

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo small />
          <div className="flex items-center gap-2">
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
                  <div>
                    <p className="text-sm font-extrabold tracking-wide text-ink-soft uppercase">Nouveaux blocs</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {c.newBlocks.map((t) => <BlockView key={t} block={createBlock(t)} mode="static" />)}
                    </div>
                  </div>
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
