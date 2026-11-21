"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BlockEditor from "./BlockEditor";
import BackButton from "./BackButton";
import World2D from "./World2D";
import type { WorldEvent } from "./World3D";
import { BumpNumber, Confetti, Cubo, Logo, SoundToggle, useVoiceOn } from "./ui";
import { Icon, StarIcon } from "./Icon";
import { ArrowRight, BookOpen, Blocks, Flame, Gem, Gift, Hourglass, KeyRound, LayoutGrid, Lightbulb, Lock, Palette, Play, Shirt, Trophy, Rabbit, RotateCcw, Trash2, Turtle, Volume2 } from "lucide-react";
import StoryModal from "./StoryModal";
import ProfileMenu from "./ProfileMenu";
import { DATA_EVENT } from "@/lib/profiles";
import { BLOCKS, type Block, type Category } from "@/lib/blocks";
import {
  COURSES, DIFFICULTY, FAIL_MESSAGES, buildWorld, countBlocks, runProgram, starsFor,
  type Outcome, type Step, type World,
} from "@/lib/levels";
import { load, loadSession, save, saveSession } from "@/lib/storage";
import { BADGES, badgeItems, badgesFor, emptyProgress, newItems, totalStars as allStars, type Item, type Progress } from "@/lib/rewards";
import { CHEERS, LINES, badgeLine, giftLine, tipLine, winLine } from "@/lib/lines";
import { MAP_COURSES, STORY } from "@/lib/story";
import { getVoicePrefs, sfx, speak } from "@/lib/sound";

const World3D = dynamic(() => import("./World3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center font-display text-xl">Chargement du monde…</div>,
});

type Mood = "happy" | "wow" | "sad" | "think";
type WinInfo = { stars: number; used: number; best: boolean; badges: string[]; gifts: Item[]; outro: boolean };
type Msg = { text: string; mood: Mood; say: string[] };
const msgOf = (say: string[], mood: Mood): Msg => ({ text: say.join(" "), mood, say });

/** Parcours entièrement réussis. */
const coursesDone = (p: Progress) => COURSES.filter((c) => c.levels.every((l) => p.stars[`${c.slug}:${l.id}`])).map((c) => c.slug);

const STEP_SFX: Partial<Record<Step["kind"], Parameters<typeof sfx>[0]>> = {
  move: "step", turn: "turn", collect: "gem", break: "crack", bridge: "plank",
  bump: "bump", splash: "splash", nothing: "click",
  key: "coin", open: "magic", jump: "jump", burn: "fail",
  hit: "crack", wait: "turn", caught: "boing",
};


function groupsFor(types: string[]) {
  const order: Category[] = ["motion", "action", "control"];
  return [{ category: order[0], types: [...types].sort((a, b) => order.indexOf(BLOCKS[a].category) - order.indexOf(BLOCKS[b].category)) }];
}

export default function LevelGame({ slug }: { slug: string }) {
  const course = COURSES.find((c) => c.slug === slug) ?? COURSES[0];
  const LEVELS = course.levels;
  const sk = (id: number) => `${course.slug}:${id}`;
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [idx, setIdx] = useState(0);
  const level = LEVELS[idx];
  const initial = useMemo(() => buildWorld(level), [level]);
  const [program, setProgram] = useState<Block[]>([]);
  const [world, setWorld] = useState<World>(initial);
  const [event, setEvent] = useState<WorldEvent>({ kind: "reset", key: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [fast, setFast] = useState(false);
  const [view3d, setView3d] = useState(true);
  const [msg, setMsg] = useState<Msg>(msgOf([level.goal], "happy"));
  // Série de la session : niveaux réussis depuis l'arrivée. Se tromper ne la remet jamais à zéro.
  const [streak, setStreak] = useState(0);
  const [story, setStory] = useState<"intro" | "outro" | null>(null);
  const [fails, setFails] = useState(0);
  const [win, setWin] = useState<WinInfo | null>(null);
  const [shake, setShake] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [hop, setHop] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const evKey = useRef(1);
  const voiceOn = useVoiceOn();

  // Lecture automatique des messages de Cubo (option du menu son)
  useEffect(() => {
    if (ready && !story && getVoicePrefs().auto) speak(msg.say);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg.text, ready, story]);

  // Chargement initial (progression + vue)
  useEffect(() => {
    const p = load<Progress>("progress", emptyProgress);
    setProgress(p);
    setView3d(load("view3d", true));
    setStreak(loadSession("streak", 0));
    const lockedNow = !!course.unlockStars && allStars(p) < course.unlockStars;
    if (!lockedNow && STORY[course.slug] && !load<string[]>("story", []).includes(`${course.slug}:intro`)) setStory("intro");
    const firstTodo = LEVELS.findIndex((l) => !p.stars[sk(l.id)]);
    // « ?niveau=N » dans l'adresse ouvre directement ce niveau (s'il est débloqué), sinon le premier à faire.
    const asked = Number(new URLSearchParams(window.location.search).get("niveau")) - 1;
    const askedOk = Number.isInteger(asked) && asked >= 0 && asked < LEVELS.length && (asked === 0 || !!p.stars[sk(LEVELS[asked - 1].id)]);
    setIdx(askedOk ? asked : firstTodo === -1 ? LEVELS.length - 1 : firstTodo);
    setReady(true);
  }, []);

  // Progression mise à jour par une synchronisation en ligne
  useEffect(() => {
    const reload = () => setProgress(load<Progress>("progress", emptyProgress));
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, []);

  // Échap ferme la fenêtre de victoire
  useEffect(() => {
    if (!win) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setWin(null); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [win]);

  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => stop, []);

  // Changement de niveau
  useEffect(() => {
    if (!ready) return;
    stop();
    setRunning(false);
    setProgram(load<Block[]>(`prog:${course.slug}:${level.id}`, []));
    setWorld(initial);
    setActiveId(null);
    setEvent({ kind: "reset", key: evKey.current++ });
    setMsg(msgOf([level.goal], "happy"));
    setFails(0);
  }, [ready, level, initial]);

  const changeProgram = useCallback((p: Block[]) => {
    setProgram(p);
    save(`prog:${course.slug}:${level.id}`, p);
  }, [level.id, course.slug]);

  const unlocked = (i: number) => i === 0 || !!progress.stars[sk(LEVELS[i - 1].id)];
  const totalStars = LEVELS.reduce((a, l) => a + (progress.stars[sk(l.id)] ?? 0), 0);
  const locked = !!course.unlockStars && ready && allStars(progress) < course.unlockStars;
  const markSeen = (k: "intro" | "outro") => {
    const seen = load<string[]>("story", []);
    if (!seen.includes(`${course.slug}:${k}`)) save("story", [...seen, `${course.slug}:${k}`]);
  };
  const used = countBlocks(program);

  const reset = () => {
    stop();
    setRunning(false);
    setWorld(initial);
    setActiveId(null);
    setEvent({ kind: "reset", key: evKey.current++ });
  };

  const finish = (out: Outcome) => {
    setRunning(false);
    setActiveId(null);
    if (out.ok) {
      const stars = starsFor(level, used);
      const prev = progress.stars[sk(level.id)] ?? 0;
      const after: Progress = { ...progress, stars: { ...progress.stars, [sk(level.id)]: Math.max(prev, stars) } };
      const newBadges = badgesFor({
        slug: course.slug, levelId: level.id, difficulty: course.difficulty, stars, prevStars: prev, fails, used,
        optimal: level.optimal, program, after, coursesDone: coursesDone(after),
      }, progress.badges);
      const next: Progress = { ...after, badges: [...progress.badges, ...newBadges] };
      const gifts = [...newItems(allStars(progress), allStars(next)), ...badgeItems(newBadges)].map((g) => g.item);
      const isLast = idx === LEVELS.length - 1;
      const outro = isLast && !!STORY[course.slug] && !load<string[]>("story", []).includes(`${course.slug}:outro`);
      setProgress(next);
      save("progress", next);
      setStreak((n) => { saveSession("streak", n + 1); return n + 1; });
      sfx("win");
      setConfetti((c) => c + 1);
      const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
      setMsg(msgOf([cheer, LINES.treasure], "wow"));
      setTimeout(() => setWin({ stars, used, best: stars > prev, badges: newBadges, gifts, outro }), 900);
    } else {
      sfx("fail");
      setShake((s) => s + 1);
      const n = fails + 1;
      setFails(n);
      const base = FAIL_MESSAGES[out.reason];
      const say = out.reason === "empty" || n === 1 ? [base, LINES.retry]
        : n === 3 ? [base, LINES.keepGoing] : [base, tipLine(level.tip)];
      setMsg(msgOf(say, "sad"));
    }
  };

  const run = () => {
    if (running) return;
    reset();
    setRunning(true);
    setMsg(msgOf([LINES.go], "think"));
    sfx("click");
    const gen = runProgram(initial, program);
    const tick = () => {
      const r = gen.next();
      if (r.done) { finish(r.value); return; }
      const st = r.value;
      setWorld(st.world);
      setActiveId(st.blockId);
      setEvent({ kind: st.kind, at: st.at, key: evKey.current++ });
      const s = STEP_SFX[st.kind];
      if (s) sfx(s);
      const base = fast ? 0.5 : 1;
      const d = st.kind === "check" ? 320 : st.kind === "turn" ? 380 : st.kind === "splash" || st.kind === "burn" ? 900 : st.kind === "jump" ? 700 : st.kind === "caught" ? 900 : st.kind === "win" ? 300 : 560;
      timer.current = setTimeout(tick, d * base);
    };
    timer.current = setTimeout(tick, 300);
  };

  const goLevel = (i: number) => {
    if (!unlocked(i) || running) { sfx("bump"); return; }
    sfx("click");
    setWin(null);
    setIdx(i);
  };

  const fallback2D = <World2D world={world} />;

  if (locked) return <LockedWorld need={course.unlockStars!} have={allStars(progress)} />;

  return (
    <div className="flex min-h-dvh flex-col bg-cream lg:h-dvh lg:min-h-[620px] lg:overflow-hidden">
      <Confetti fire={confetti} />

      {/* Barre du haut */}
      <header className="sticky top-0 z-40 flex min-h-[72px] shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-[3px] border-ink bg-paper px-3 py-2 sm:px-4 lg:flex-nowrap">
        <BackButton fallback="/jouer/" label="Défis" />
        <Logo small />
        <nav aria-label="Niveaux" className="order-last flex w-full items-center overflow-x-auto px-1 pt-1 pb-3 lg:order-none lg:mx-auto lg:w-auto lg:overflow-visible lg:p-0">
          {LEVELS.map((l, i) => {
            const st = progress.stars[sk(l.id)] ?? 0;
            const open = unlocked(i);
            const cur = i === idx;
            return (
              <div key={l.id} className="flex items-center">
                {i > 0 && <span className={`h-[5px] w-3 ${open ? "bg-ink" : "bg-ink/20"}`} aria-hidden="true" />}
                <motion.button
                  whileHover={open ? { y: -3 } : undefined}
                  whileTap={open ? { scale: 0.9 } : undefined}
                  animate={cur ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={cur ? { repeat: Infinity, duration: 1.6 } : undefined}
                  onClick={() => goLevel(i)}
                  aria-current={cur ? "step" : undefined}
                  aria-label={`Niveau ${l.id}${open ? "" : " (verrouillé)"}${st ? `, ${st} étoile${st > 1 ? "s" : ""}` : ""}`}
                  className={`relative grid size-11 place-items-center rounded-full border-[3px] border-ink font-display text-lg font-bold ${
                    cur ? "bg-grape text-white shadow-pop" : st ? "bg-mint shadow-pop" : open ? "bg-paper shadow-pop" : "bg-[#E8E4F0] text-ink-soft"
                  }`}
                >
                  {open ? l.id : <Lock size={18} strokeWidth={3} aria-hidden="true" />}
                  {st > 0 && (
                    <span className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2" aria-hidden="true">
                      {Array.from({ length: st }, (_, k) => <StarIcon key={k} size={13} />)}
                    </span>
                  )}
                </motion.button>
              </div>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="toon flex items-center gap-1.5 rounded-full bg-sun px-3 py-1.5 font-display text-lg font-bold" title="Étoiles gagnées">
            <StarIcon size={22} /><BumpNumber value={totalStars} /><span className="sr-only">étoiles</span>
          </div>
          <AnimatePresence>
            {streak >= 2 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="toon flex items-center gap-1 rounded-full bg-orange px-3 py-1.5 font-display text-lg font-bold"
                title="Niveaux réussis aujourd'hui. Se tromper n'efface rien !"
              >
                <motion.span animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 0.6 }} aria-hidden="true"><Flame size={22} strokeWidth={2.75} fill="#FFD23F" /></motion.span>
                <BumpNumber value={streak} /><span className="sr-only">niveaux réussis aujourd'hui</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="toon flex items-center gap-1.5 rounded-full bg-lilac px-3 py-1.5 font-display text-lg font-bold" title={Object.entries(BADGES).filter(([k]) => progress.badges.includes(k)).map(([, b]) => b.name).join(", ") || "Aucun badge pour l'instant"}>
            <Trophy size={20} strokeWidth={2.75} aria-hidden="true" /><BumpNumber value={progress.badges.length} /><span className="sr-only">badges</span>
          </div>
          <ProfileMenu />
          <Link href="/cubo/" aria-label="Mon Cubo" className="btn flex items-center gap-2 whitespace-nowrap bg-sky px-3 py-2 text-base" title="Change le look de Cubo"><Shirt size={20} strokeWidth={2.75} aria-hidden="true" /> <span className="hidden 2xl:inline">Mon Cubo</span></Link>
          <Link href="/creer/" aria-label="Créer" title="Création libre" className="btn flex items-center gap-2 whitespace-nowrap bg-pink px-3 py-2 text-base"><Palette size={20} strokeWidth={2.75} aria-hidden="true" /> <span className="hidden 2xl:inline">Créer</span></Link>
          <SoundToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        {/* Colonne monde */}
        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[min(40vw,560px)]">
          <div className="flex items-start gap-2">
            <motion.div key={hop} initial={{ y: 0 }} animate={{ y: [0, -14, 0] }} transition={{ duration: 0.35 }} className="shrink-0">
              <Cubo size={64} mood={msg.mood} />
            </motion.div>
            <div className="toon relative min-h-[76px] flex-1 rounded-3xl bg-paper px-4 py-2.5">
              <span className="absolute top-6 -left-[11px] size-4 rotate-45 border-b-[3px] border-l-[3px] border-ink bg-paper" aria-hidden="true" />
              <p className="mb-0.5 font-display text-sm font-bold text-grape">
                {course.title} · {level.id}. {level.title}{" "}
                <span className="ml-1 rounded-full bg-lilac px-2 py-0.5 text-xs text-ink">{level.concept}</span>{" "}
                <span className="rounded-full px-2 py-0.5 text-xs text-ink" style={{ background: course.color }}>{DIFFICULTY[course.difficulty]}</span>
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={msg.text}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="pr-10 text-[15px] font-bold leading-snug"
                  aria-live="polite"
                >
                  {msg.text}
                </motion.p>
              </AnimatePresence>
              {voiceOn && (
                <button onClick={() => speak(msg.say)} className="btn absolute top-2 right-2 grid size-9 place-items-center bg-sky" aria-label="Écouter la consigne"><Volume2 size={18} strokeWidth={2.75} aria-hidden="true" /></button>
              )}
            </div>
          </div>

          <div
            key={shake}
            className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-3xl border-[3px] border-ink shadow-pop sm:aspect-[16/10] lg:aspect-auto lg:min-h-0 lg:flex-1 ${shake ? "shake" : ""}`}
            style={{ background: "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)" }}
          >
            {/* La vue remplit exactement le cadre (taille définie aussi sur mobile/tablette) */}
            <div className="absolute inset-0">
              {ready && (view3d ? <World3D world={world} event={event} fallback={fallback2D} /> : fallback2D)}
            </div>
            <div className="absolute top-2 left-2 flex flex-wrap gap-2">
              {initial.keys.length > 0 && (
                <span className="toon flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 font-display font-bold" title="Clés dans le sac">
                  <KeyRound size={18} strokeWidth={2.75} color="#7A5A00" aria-hidden="true" /> <BumpNumber value={world.keysHeld} />
                  <span className="sr-only">clés</span>
                </span>
              )}
              {initial.totalGems > 0 && (
                <span className="toon flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 font-display font-bold">
                  <Gem size={18} strokeWidth={2.75} color="#0A6F86" aria-hidden="true" /> <BumpNumber value={initial.totalGems - world.gems.length} /> / {initial.totalGems}
                </span>
              )}

            </div>
            <button
              onClick={() => { const v = !view3d; setView3d(v); save("view3d", v); sfx("click"); }}
              className="btn absolute top-2 right-2 bg-paper px-3 py-1 text-sm"
              aria-label={view3d ? "Passer en vue 2D" : "Passer en vue 3D"}
            >
              {view3d ? "Vue 2D" : "Vue 3D"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              onClick={run} disabled={running}
              className="btn flex flex-1 items-center justify-center gap-2 bg-mint py-3 text-2xl"
            >
              {running ? <><Hourglass size={24} strokeWidth={2.75} aria-hidden="true" /> En cours…</> : <><Play size={24} strokeWidth={2.75} fill="#16123A" aria-hidden="true" /> Lancer</>}
            </motion.button>
            <button onClick={() => { reset(); sfx("click"); }} className="btn bg-paper px-5 py-3" aria-label="Recommencer"><RotateCcw size={24} strokeWidth={3} aria-hidden="true" /></button>
            <button
              onClick={() => { setFast(!fast); sfx("click"); }}
              className={`btn px-4 py-3 ${fast ? "bg-orange" : "bg-paper"}`}
              aria-pressed={fast}
              aria-label={fast ? "Vitesse rapide" : "Vitesse normale"}
              title="Vitesse"
            >
              {fast ? <Rabbit size={24} strokeWidth={2.75} aria-hidden="true" /> : <Turtle size={24} strokeWidth={2.75} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Éditeur */}
        <BlockEditor
          program={program}
          onChange={changeProgram}
          groups={groupsFor(level.blocks)}
          mode="stack"
          activeId={activeId}
          disabled={running}
          onAdd={() => setHop((h) => h + 1)}
          title="Mon programme"
          toolbar={
            <>
              <span className="toon flex items-center gap-1 rounded-full bg-paper px-3 py-0.5 text-sm font-extrabold whitespace-nowrap" title={`Blocs utilisés. 3 étoiles avec ${level.optimal} blocs ou moins.`}>
                <Blocks size={16} strokeWidth={2.75} aria-hidden="true" /> <BumpNumber value={used} /> / {level.optimal} <StarIcon size={16} />
              </span>
              <button
                onClick={() => { if (program.length) { changeProgram([]); sfx("trash"); } }}
                className="btn flex items-center gap-1 bg-paper px-3 py-0.5 text-sm whitespace-nowrap"
              >
                <Trash2 size={15} strokeWidth={2.75} aria-hidden="true" /> Effacer
              </button>
            </>
          }
        />
      </main>

      <AnimatePresence>
        {win && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/50 px-4 pt-20 pb-6 sm:items-center sm:py-16"
            role="dialog" aria-modal="true" aria-labelledby="win-title"
            // Un clic à côté de la carte ferme la fenêtre (le niveau reste affiché tel quel)
            onPointerDown={(e) => { if (e.target === e.currentTarget) { setWin(null); sfx("click"); } }}
          >
            <WinCard
              info={win}
              levelId={level.id}
              optimal={level.optimal}
              last={idx === LEVELS.length - 1}
              onReplay={() => { setWin(null); reset(); }}
              onNext={() => goLevel(idx + 1)}
              onStory={() => { setWin(null); setStory("outro"); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {story && STORY[course.slug] && (
          <StoryModal
            key={story}
            scene={STORY[course.slug][story]}
            map={STORY[course.slug].piece !== undefined ? {
              got: MAP_COURSES.map((c) => coursesDone(progress).includes(c)),
              fresh: story === "outro" ? STORY[course.slug].piece : undefined,
            } : undefined}
            cta={story === "intro" ? "C'est parti !" : "Super !"}
            onClose={() => { markSeen(story); setStory(null); if (story === "intro") speak(level.goal); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WinCard({ info, levelId, optimal, last, onReplay, onNext, onStory }: {
  info: WinInfo; levelId: number; optimal: number; last: boolean; onReplay: () => void; onNext: () => void; onStory: () => void;
}) {
  useEffect(() => {
    const ts = [0, 1, 2].filter((i) => i < info.stars).map((i) => setTimeout(() => sfx("star", i), 350 + i * 300));
    if (info.badges.length || info.gifts.length) ts.push(setTimeout(() => sfx("badge"), 1400));
    speak([winLine(info.stars), ...info.badges.map((k) => badgeLine(BADGES[k].name)), ...info.gifts.map((g) => giftLine(g.name))]);
    return () => ts.forEach(clearTimeout);
  }, [info]);

  return (
    <motion.div
      initial={{ scale: 0.4, rotate: -6, y: 60 }} animate={{ scale: 1, rotate: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      className="relative h-fit w-[440px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:rounded-[36px] sm:p-7"
    >
      <motion.div className="absolute -top-16 left-1/2 -translate-x-1/2" animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        <Cubo size={100} mood="wow" />
      </motion.div>
      <h2 id="win-title" className="mt-8 text-3xl font-bold sm:text-4xl">Niveau {levelId} réussi !</h2>
      <div className="my-4 flex justify-center gap-3" aria-label={`${info.stars} étoiles sur 3`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: i < info.stars ? 1 : 0.8, rotate: 0 }}
            transition={{ delay: 0.35 + i * 0.3, type: "spring", stiffness: 400, damping: 10 }}
            aria-hidden="true"
          >
            <StarIcon size={68} filled={i < info.stars} className="size-14 sm:size-[68px]" />
          </motion.span>
        ))}
      </div>
      <p className="text-lg font-bold">
        Tu as utilisé <strong className="text-grape">{info.used}</strong> bloc{info.used > 1 ? "s" : ""}.
      </p>
      {info.stars < 3 && (
        <p className="mt-1 flex items-center gap-2 rounded-2xl bg-sun/40 px-3 py-2 text-left font-bold">
          <Lightbulb size={28} strokeWidth={2.5} className="shrink-0" aria-hidden="true" /> Défi : peux-tu réussir avec seulement {optimal} blocs ? Essaie la boucle « répéter » !
        </p>
      )}
      {info.badges.map((k) => (
        <motion.div
          key={k}
          initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 1.4, type: "spring" }}
          className="toon mt-3 flex items-center gap-3 rounded-2xl bg-lilac px-4 py-2 text-left"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-sun" aria-hidden="true"><Icon name={BADGES[k].icon} size={28} /></span>
          <span>
            <span className="block font-display text-lg font-bold">Nouveau badge : {BADGES[k].name}</span>
            <span className="font-bold">{BADGES[k].text}</span>
          </span>
        </motion.div>
      ))}
      {info.gifts.map((g) => (
        <motion.div
          key={g.id}
          initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 1.6, type: "spring" }}
          className="toon mt-3 flex items-center gap-3 rounded-2xl bg-sky/60 px-4 py-2 text-left"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-paper" aria-hidden="true"><Gift size={28} strokeWidth={2.75} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold">Cadeau pour Cubo : {g.name} !</span>
            <Link href="/cubo/" className="font-extrabold text-grape underline">Essayer dans « Mon Cubo »</Link>
          </span>
        </motion.div>
      ))}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <button onClick={onReplay} className="btn flex items-center justify-center gap-1.5 bg-paper py-3 text-lg sm:flex-1"><RotateCcw size={18} strokeWidth={3} aria-hidden="true" /> Rejouer</button>
        {last && info.outro ? (
          <motion.button
            autoFocus
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
            onClick={onStory} className="btn flex items-center justify-center gap-2 bg-sun py-3 text-lg sm:flex-[2]"
          >
            <BookOpen size={20} strokeWidth={2.75} aria-hidden="true" /> La suite de l'histoire
          </motion.button>
        ) : last ? (
          <Link href="/jouer/" className="btn flex items-center justify-center gap-2 bg-pink py-3 text-lg sm:flex-[2]"><Trophy size={20} strokeWidth={2.75} aria-hidden="true" /> Autres défis</Link>
        ) : (
          <motion.button
            autoFocus
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
            onClick={onNext} className="btn flex items-center justify-center gap-2 bg-mint py-3 text-lg sm:flex-[2]"
          >
            Niveau suivant <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/** Écran du monde secret tant que le phare n'est pas allumé. */
function LockedWorld({ need, have }: { need: number; have: number }) {
  useEffect(() => { if (getVoicePrefs().auto) speak(LINES.locked); }, []);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="toon w-[460px] max-w-full rounded-[32px] bg-paper p-6 text-center">
        <div className="flex justify-center"><Cubo size={96} mood="think" /></div>
        <h1 className="mt-2 text-3xl font-bold">L'île secrète</h1>
        <p className="mt-2 text-lg font-bold">{LINES.locked}</p>
        <p className="mt-4 flex items-center justify-center gap-2 font-display text-2xl font-bold"><StarIcon size={28} /> {have} / {need}</p>
        <div className="mt-2 h-5 overflow-hidden rounded-full border-[3px] border-ink bg-cream" role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={have} aria-label={`Étoiles : ${have} sur ${need}`}>
          <div className="h-full bg-sun" style={{ width: `${Math.min(100, (have / need) * 100)}%` }} />
        </div>
        <p className="mt-3 text-sm font-bold text-ink-soft">Astuce : rejoue les niveaux où tu as moins de 3 étoiles !</p>
        <Link href="/jouer/" className="btn mt-5 inline-flex items-center gap-2 bg-mint px-6 py-3 text-lg"><LayoutGrid size={20} strokeWidth={2.75} aria-hidden="true" /> Retour aux défis</Link>
      </div>
    </div>
  );
}
