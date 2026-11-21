"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Info, Lock, Palette, Shirt, Sparkles, X } from "lucide-react";
import StoryModal, { TreasureMap } from "./StoryModal";
import { AnimatePresence } from "motion/react";
import { useRef } from "react";
import World2D from "./World2D";
import ProfileMenu from "./ProfileMenu";
import BackButton from "./BackButton";
import { Cubo, Logo, SoundToggle } from "./ui";
import { Icon, StarIcon } from "./Icon";
import { BlockView } from "./BlockView";
import { createBlock } from "@/lib/blocks";
import { BLOCKS } from "@/lib/blocks";
import { COURSES, DIFFICULTY, buildWorld, type Course } from "@/lib/levels";
import { load, loadSession, saveSession } from "@/lib/storage";
import { BADGES, emptyProgress, nextItem, totalStars, type Progress } from "@/lib/rewards";
import { ISLAND_STARS, MAP_COURSES, STORY } from "@/lib/story";
import { sfx } from "@/lib/sound";
import { DATA_EVENT } from "@/lib/profiles";

/** Défis affichés par page : seuls les aperçus de la page en cours sont dessinés. */
const PAGE_SIZE = 4;

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pages des défis">
      <button onClick={() => onPage(page - 1)} disabled={page === 0} className="btn grid size-12 place-items-center bg-paper disabled:opacity-40" aria-label="Page précédente">
        <ArrowLeft size={22} strokeWidth={3} aria-hidden="true" />
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPage(i)}
          aria-current={i === page ? "page" : undefined}
          aria-label={`Page ${i + 1}`}
          className={`btn grid size-12 place-items-center font-display text-xl ${i === page ? "bg-grape text-white" : "bg-paper"}`}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === pages - 1} className="btn grid size-12 place-items-center bg-paper disabled:opacity-40" aria-label="Page suivante">
        <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
      </button>
    </nav>
  );
}

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
    <div ref={box} className="pointer-events-none relative">
      <div
        className="relative h-52 overflow-hidden rounded-2xl border-[3px] border-ink"
        style={{ background: "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 p-3" aria-hidden="true">
          <World2D world={world} />
        </div>
        <span className="absolute bottom-2 left-2 rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-xs font-extrabold">
          Niveau {level.id} : {level.title}
        </span>
        <span className="sr-only">Aperçu du niveau {level.id} : {level.title}</span>
      </div>

      {/* Bouton « i » dans le coin bas droit */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
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
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            role="dialog" aria-label={`Nouveaux blocs de ${course.title}`}
            className="pointer-events-auto absolute right-2 bottom-14 z-20 w-[min(300px,calc(100%-1rem))] origin-bottom-right rounded-3xl border-[3px] border-ink bg-paper p-4 shadow-pop-lg"
          >
            <button onClick={onClose} className="absolute top-2 right-2 grid size-8 place-items-center rounded-full hover:bg-cream" aria-label="Fermer">
              <X size={18} strokeWidth={3} aria-hidden="true" />
            </button>
            <p className="pr-8 text-sm font-extrabold tracking-wide text-ink-soft uppercase">Nouveaux blocs</p>
            <div className="mt-2 flex flex-col gap-2">
              {course.newBlocks.map((t) => <BlockView key={t} block={createBlock(t)} mode="static" />)}
              {course.newBlocks.length === 0 && <p className="font-bold">Aucun : tu les connais déjà tous !</p>}
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
  const [replay, setReplay] = useState<string | null>(null);
  const total = totalStars(progress);
  const done = (slug: string) => {
    const c = COURSES.find((x) => x.slug === slug);
    return !!c && c.levels.every((l) => progress.stars[`${c.slug}:${l.id}`]);
  };
  const got = MAP_COURSES.map(done);
  const gift = nextItem(total);
  const [seen, setSeen] = useState<string[]>([]);
  const pages = Math.ceil(COURSES.length / PAGE_SIZE);
  const [page, setPage] = useState(0);
  const grid = useRef<HTMLDivElement>(null);
  const goPage = (p: number) => {
    const n = Math.max(0, Math.min(pages - 1, p));
    sfx("click");
    setPage(n);
    setOpenInfo(null);
    saveSession("hubPage", n);
    grid.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    const reload = () => { setProgress(load<Progress>("progress", emptyProgress)); setSeen(load<string[]>("story", [])); };
    reload();
    setPage(Math.min(pages - 1, loadSession("hubPage", 0)));
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [pages]);

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <BackButton fallback="/" />
            <span className="hidden sm:block"><Logo small /></span>
          </div>
          <div className="flex items-center gap-2">
            <ProfileMenu />
            <Link href="/cubo/" aria-label="Mon Cubo" title="Mon Cubo" className="btn flex items-center gap-2 whitespace-nowrap bg-sky px-4 py-2">
              <Shirt size={20} strokeWidth={2.75} aria-hidden="true" /> <span className="hidden lg:inline">Mon Cubo</span>
            </Link>
            <Link href="/creer/" aria-label="Création libre" title="Création libre" className="btn flex items-center gap-2 whitespace-nowrap bg-pink px-4 py-2">
              <Palette size={20} strokeWidth={2.75} aria-hidden="true" /> <span className="hidden lg:inline">Création libre</span>
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

        <section className="toon mt-8 grid items-center gap-6 rounded-[30px] bg-paper p-5 sm:p-6 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center"><TreasureMap got={got} size={190} /></div>
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">La carte au trésor</h2>
            <p className="mt-1 font-bold text-ink-soft">
              {got.every(Boolean)
                ? "La carte est complète ! Elle mène à l'île secrète."
                : `Chaque défi terminé te donne un morceau de la carte. Tu en as ${got.filter(Boolean).length} sur 4.`}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm font-extrabold">
              <span>Le phare de l'île</span>
              <span className="flex items-center gap-1"><StarIcon size={16} /> {Math.min(total, ISLAND_STARS)} / {ISLAND_STARS}</span>
            </div>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full border-[3px] border-ink bg-cream" role="progressbar" aria-valuemin={0} aria-valuemax={ISLAND_STARS} aria-valuenow={Math.min(total, ISLAND_STARS)} aria-label="Étoiles pour allumer le phare">
              <motion.div className="h-full bg-sun" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (total / ISLAND_STARS) * 100)}%` }} transition={{ duration: 0.9 }} />
            </div>
            {gift && (
              <p className="mt-3 text-sm font-bold">
                Prochain cadeau pour Cubo à <strong>{gift.item.stars} étoiles</strong> : {gift.item.name}.{" "}
                <Link href="/cubo/" className="font-extrabold text-grape underline">Voir Mon Cubo</Link>
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {[...MAP_COURSES, "ile-secrete"].filter((c) => seen.includes(`${c}:outro`)).map((c) => (
                <button key={c} onClick={() => { sfx("click"); setReplay(c); }} className="btn flex items-center gap-1.5 bg-cream px-3 py-1 text-sm">
                  <BookOpen size={15} strokeWidth={2.75} aria-hidden="true" /> {STORY[c].outro.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div ref={grid} className="mt-10 grid scroll-mt-24 gap-8 md:grid-cols-2">
          {COURSES.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((c, i) => {
            const done = c.levels.filter((l) => progress.stars[`${c.slug}:${l.id}`]).length;
            const stars = c.levels.reduce((a, l) => a + (progress.stars[`${c.slug}:${l.id}`] ?? 0), 0);
            const max = c.levels.length * 3;
            const label = done === c.levels.length ? "Rejouer" : done > 0 ? "Continuer" : "Commencer";
            const locked = !!c.unlockStars && total < c.unlockStars;
            if (locked) return (
              <motion.article
                key={c.slug}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[30px] border-[3px] border-dashed border-ink bg-paper/70 p-8 text-center"
              >
                <span className="grid size-16 place-items-center rounded-full border-[3px] border-ink bg-cream"><Lock size={30} strokeWidth={2.75} aria-hidden="true" /></span>
                <h2 className="text-3xl font-bold">{c.title}</h2>
                <p className="font-bold text-ink-soft">Un monde secret… Allume le phare avec {c.unlockStars} étoiles pour le découvrir !</p>
                <p className="flex items-center gap-1 font-display text-xl font-bold"><StarIcon size={22} /> {total} / {c.unlockStars}</p>
              </motion.article>
            );
            return (
              <motion.article
                key={c.slug}
                initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                style={{ boxShadow: "8px 9px 0 0 #16123A", zIndex: openInfo === c.slug ? 30 : undefined }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 140, damping: 16 }}
                whileHover={{ y: -6 }}
                className="group relative flex cursor-pointer flex-col rounded-[30px] border-[3px] border-ink bg-paper focus-within:outline-4 focus-within:outline-offset-4 focus-within:outline-grape"
              >
                {/* Toute la carte est cliquable */}
                <Link href={`/jouer/${c.slug}/`} onClick={() => sfx("click")} className="absolute inset-0 z-0 rounded-[27px]" tabIndex={-1} aria-hidden="true" />
                {c.slug === COURSES[0].slug && (
                  <motion.span
                    animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="toon pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-sun px-3 py-1 font-display text-sm font-bold"
                  >
                    <Sparkles size={15} strokeWidth={2.75} aria-hidden="true" /> Commence ici !
                  </motion.span>
                )}
                <div className="rounded-t-[27px] border-b-[3px] border-ink px-6 pt-5 pb-4" style={{ background: c.color }}>
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
                    className="btn relative z-10 flex items-center justify-center gap-2 py-3 text-xl"
                    aria-label={`${label} : ${c.title}`}
                    style={{ background: c.color }}
                  >
                    {label} <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
        <Pager page={page} pages={pages} onPage={goPage} />

        <section className="toon mt-12 rounded-[30px] bg-paper p-6">
          <h2 className="text-2xl font-bold">Mes badges <span className="text-lg text-ink-soft">({progress.badges.length} / {Object.keys(BADGES).length})</span></h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(BADGES).map(([k, b]) => {
              const got = progress.badges.includes(k);
              const hidden = b.secret && !got;
              return (
                <li key={k} className={`flex items-center gap-3 rounded-2xl border-[3px] p-3 ${got ? "border-ink bg-lilac" : "border-ink/20 bg-cream"}`}>
                  <span className={`grid size-12 shrink-0 place-items-center rounded-full border-[3px] ${got ? "border-ink bg-sun" : "border-ink/25 text-ink/35"}`}>
                    {hidden ? <span className="font-display text-xl font-bold">?</span> : <Icon name={b.icon} size={24} />}
                  </span>
                  <span>
                    <span className={`block font-display text-lg font-bold ${got ? "" : "text-ink-soft"}`}>{hidden ? "Badge secret" : b.name}</span>
                    <span className="text-sm font-bold text-ink-soft">{got ? b.text : hidden ? b.hint : "À débloquer…"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <AnimatePresence>
        {replay && (
          <StoryModal
            scene={STORY[replay].outro}
            map={STORY[replay].piece !== undefined ? { got } : undefined}
            cta="Fermer"
            onClose={() => setReplay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
