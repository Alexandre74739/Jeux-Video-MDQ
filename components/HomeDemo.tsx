"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Play, RotateCcw, Trash2 } from "lucide-react";
import { Confetti, Cubo } from "./ui";
import { StarIcon } from "./Icon";
import World2D from "./World2D";
import type { WorldEvent } from "./World3D";
import { buildWorld, newId, runProgram, type Block, type LevelDef, type Outcome, type World } from "@/lib/levels";
import { load, save } from "@/lib/storage";
import { sfx } from "@/lib/sound";

const World3D = dynamic(() => import("./World3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center font-display text-xl">Chargement du monde…</div>,
});

/** Niveau de démonstration : le coffre est à 4 cases devant Cubo. */
const DEMO: LevelDef = {
  id: 0, title: "Démo", concept: "Séquence", goal: "", tip: "",
  grid: ["TTTTTTT", "TS...FT", "TTTTTTT"], startDir: 1, blocks: ["avancer"], optimal: 4, solution: [],
};
const MAX = 7;
const STEP_MS: Partial<Record<string, number>> = { move: 520, bump: 600, win: 300 };

type State = "idle" | "run" | "short" | "far";

/** Mini-démo de l'accueil, dans le vrai monde du jeu (3D ou 2D) : ajoute des « avancer » et amène Cubo au coffre. */
export default function HomeDemo() {
  const initial = useMemo(() => buildWorld(DEMO), []);
  const [prog, setProg] = useState<Block[]>([]);
  const [world, setWorld] = useState<World>(initial);
  const [event, setEvent] = useState<WorldEvent>({ kind: "reset", key: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [won, setWon] = useState(false);
  const [fire, setFire] = useState(0);
  const [view3d, setView3d] = useState(true);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const evKey = useRef(1);

  useEffect(() => { setView3d(load("view3d", true)); setReady(true); }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setWorld(initial);
    setActiveId(null);
    setEvent({ kind: "reset", key: evKey.current++ });
  };

  const add = () => {
    if (state === "run" || prog.length >= MAX) return;
    reset();
    setProg((p) => [...p, { id: newId(), type: "avancer", params: {} }]);
    setState("idle");
    sfx("snap");
  };
  const clear = () => { if (state === "run") return; reset(); setProg([]); setState("idle"); sfx("trash"); };

  const finish = (out: Outcome) => {
    setActiveId(null);
    if (out.ok) {
      setState("idle");
      sfx("win");
      setFire((f) => f + 1);
      setTimeout(() => setWon(true), 700);
    } else {
      setState(out.reason === "blocked" ? "far" : "short");
      sfx("fail");
    }
  };

  const run = () => {
    if (state === "run" || !prog.length) { sfx("bump"); return; }
    reset();
    setState("run");
    sfx("click");
    const gen = runProgram(initial, prog);
    const tick = () => {
      const r = gen.next();
      if (r.done) { finish(r.value); return; }
      const st = r.value;
      setWorld(st.world);
      setActiveId(st.blockId);
      setEvent({ kind: st.kind, at: st.at, key: evKey.current++ });
      if (st.kind === "move") sfx("step");
      if (st.kind === "bump") sfx("bump");
      timer.current = setTimeout(tick, STEP_MS[st.kind] ?? 500);
    };
    timer.current = setTimeout(tick, 300);
  };

  const msg = {
    idle: prog.length ? "Appuie sur Lancer pour voir Cubo avancer !" : "Ajoute des blocs « avancer », puis appuie sur Lancer !",
    run: "C'est parti…",
    short: "Presque ! Cubo n'est pas arrivé au coffre. Ajoute un bloc.",
    far: "Oups, trop loin : Cubo s'est cogné ! Enlève un bloc.",
  }[state];

  const fallback2D = <World2D world={world} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <Confetti fire={fire} />

      {/* Monde (vrai rendu du jeu) */}
      <div className="flex flex-col gap-3">
        <div
          className="toon relative aspect-[4/3] w-full overflow-hidden rounded-[28px] sm:aspect-[16/10]"
          style={{ background: "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)" }}
        >
          <div className="absolute inset-0">
            {ready && (view3d ? <World3D world={world} event={event} fallback={fallback2D} /> : fallback2D)}
          </div>
          <button
            onClick={() => { const v = !view3d; setView3d(v); save("view3d", v); sfx("click"); }}
            className="btn absolute top-3 right-3 bg-paper px-3 py-1 text-sm"
            aria-label={view3d ? "Passer en vue 2D" : "Passer en vue 3D"}
          >
            {view3d ? "Vue 2D" : "Vue 3D"}
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="toon mx-auto flex w-fit max-w-full items-center gap-3 rounded-2xl bg-paper px-4 py-2 text-center font-display text-lg font-semibold"
            aria-live="polite"
          >
            <Cubo size={40} mood={state === "short" || state === "far" ? "sad" : state === "run" ? "think" : "happy"} />
            {msg}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Programme */}
      <div className="toon flex flex-col rounded-[28px] bg-paper">
        <div className="flex items-center justify-between rounded-t-[25px] border-b-[3px] border-ink bg-sun px-5 py-3">
          <h3 className="text-xl font-bold">Mon programme</h3>
          <button onClick={clear} className="btn flex items-center gap-1.5 bg-paper px-3 py-1 text-sm">
            <Trash2 size={15} strokeWidth={2.75} aria-hidden="true" /> Effacer
          </button>
        </div>
        <div className="dots flex min-h-[230px] flex-1 flex-col gap-1.5 p-5">
          <div className="flex w-fit items-center gap-2 rounded-t-[22px] rounded-b-2xl border-[3px] border-ink bg-sun px-4 pt-2.5 pb-1.5 font-display font-semibold shadow-pop">
            <Play size={16} strokeWidth={3} fill="#16123A" aria-hidden="true" /> quand je lance
          </div>
          <div className="ml-5 flex flex-col gap-1.5 border-l-4 border-dashed border-ink/25 pl-3">
            <AnimatePresence>
              {prog.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0.5, opacity: 0, x: -20 }} animate={{ scale: 1, opacity: 1, x: 0 }} exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={`flex w-fit items-center gap-2 rounded-2xl border-[3px] border-ink bg-sky px-3 py-1.5 font-display font-semibold shadow-pop ${activeId === b.id ? "running-glow" : ""}`}
                >
                  <span className="grid size-6 place-items-center rounded-md bg-paper/70"><ArrowUp size={15} strokeWidth={3} aria-hidden="true" /></span>
                  avancer
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t-[3px] border-ink p-4">
          <motion.button whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.92 }} onClick={add} disabled={prog.length >= MAX} className="btn flex items-center gap-2 bg-sky px-4 py-2.5 text-lg disabled:opacity-50">
            <ArrowUp size={20} strokeWidth={3} aria-hidden="true" /> + avancer
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={run} disabled={state === "run"} className="btn flex flex-1 items-center justify-center gap-2 bg-mint px-4 py-2.5 text-lg">
            {state === "short" || state === "far" ? <RotateCcw size={20} strokeWidth={3} aria-hidden="true" /> : <Play size={20} strokeWidth={3} fill="#16123A" aria-hidden="true" />}
            Lancer
          </motion.button>
        </div>
      </div>

      {/* Fenêtre de victoire : on enchaîne directement sur le niveau 1 du tutoriel */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/50 px-4 pt-20 pb-6 sm:items-center sm:py-16"
            role="dialog" aria-modal="true" aria-labelledby="demo-win-title"
            onPointerDown={(e) => { if (e.target === e.currentTarget) setWon(false); }}
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -6, y: 60 }} animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="relative h-fit w-[440px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:rounded-[36px] sm:p-7"
            >
              <motion.div className="absolute -top-16 left-1/2 -translate-x-1/2" animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Cubo size={100} mood="wow" />
              </motion.div>
              <h2 id="demo-win-title" className="mt-8 text-3xl font-bold sm:text-4xl">Bravo !</h2>
              <div className="my-4 flex justify-center gap-3" aria-label="3 étoiles sur 3">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.3, type: "spring", stiffness: 400, damping: 10 }} aria-hidden="true">
                    <StarIcon size={60} />
                  </motion.span>
                ))}
              </div>
              <p className="text-lg font-bold">Tu viens d&apos;écrire ton tout premier programme. Prêt pour la vraie aventure ?</p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button onClick={() => { setWon(false); reset(); sfx("click"); }} className="btn flex items-center justify-center gap-1.5 bg-paper py-3 text-lg sm:flex-1">
                  <RotateCcw size={18} strokeWidth={3} aria-hidden="true" /> Rejouer
                </button>
                <motion.div className="sm:flex-[2]" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                  <Link href="/jouer/tutoriel/?niveau=1" autoFocus onClick={() => sfx("click")} className="btn flex w-full items-center justify-center gap-2 bg-mint py-3 text-lg">
                    Niveau suivant <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
