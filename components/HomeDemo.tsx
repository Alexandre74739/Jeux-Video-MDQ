"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Package, Play, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { Confetti, Cubo } from "./ui";
import { StarIcon } from "./Icon";
import { sfx } from "@/lib/sound";

const LEN = 5; // Cubo en case 0, coffre en case 4

/** Mini-démo de l'accueil : ajoute des blocs « avancer » et amène Cubo au coffre. */
export default function HomeDemo() {
  const [prog, setProg] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<"idle" | "run" | "win" | "short" | "far">("idle");
  const [fire, setFire] = useState(0);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);

  const add = () => {
    if (state === "run" || prog.length >= 7) return;
    setProg((p) => [...p, Math.random().toString(36)]);
    setState("idle");
    setPos(0);
    sfx("snap");
  };
  const clear = () => { if (state === "run") return; setProg([]); setPos(0); setState("idle"); sfx("trash"); };

  const run = () => {
    if (state === "run" || !prog.length) { sfx("bump"); return; }
    setPos(0);
    setState("run");
    let i = 0;
    const step = () => {
      if (i >= prog.length) {
        setActive(-1);
        if (i === LEN - 1) { setState("win"); sfx("win"); setFire((f) => f + 1); }
        else { setState("short"); sfx("fail"); }
        return;
      }
      setActive(i);
      if (i + 1 > LEN - 1) { setPos(LEN - 0.6); setState("far"); setActive(-1); sfx("bump"); return; }
      setPos(i + 1);
      sfx(i + 1 === LEN - 1 ? "gem" : "step");
      i++;
      t.current = setTimeout(step, 480);
    };
    t.current = setTimeout(step, 250);
  };

  const msg = {
    idle: "Ajoute des blocs « avancer », puis appuie sur Lancer !",
    run: "C'est parti…",
    win: "Bravo ! Tu viens d'écrire ton premier programme !",
    short: "Presque ! Cubo n'est pas arrivé. Ajoute un bloc.",
    far: "Oups, trop loin ! Enlève un bloc.",
  }[state];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <Confetti fire={fire} />
      {/* Plateau */}
      <div className="toon relative overflow-hidden rounded-[28px] bg-sky p-5 sm:p-7">
        <div className="relative mx-auto flex max-w-[520px] items-end justify-between gap-1.5 pt-24 pb-2">
          {Array.from({ length: LEN }, (_, i) => (
            <div
              key={i}
              className="relative aspect-square flex-1 rounded-xl border-[3px] border-ink"
              style={{ background: i % 2 ? "#EAD596" : "#F4E2AE", boxShadow: "0 8px 0 0 #9C6A3C, 0 8px 0 3px #16123A" }}
            >
              {i === LEN - 1 && (
                <motion.span
                  className="absolute inset-0 grid place-items-center"
                  animate={state === "win" ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : { y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: state === "win" ? 0.8 : 1.6 }}
                >
                  <Package className="size-[70%]" strokeWidth={2.5} color="#16123A" fill="#FFB27A" aria-hidden="true" />
                </motion.span>
              )}
            </div>
          ))}
          <motion.div
            className="absolute bottom-[18px] w-[calc((100%-24px)/5)]"
            animate={{ left: `calc(${pos} * ((100% - 24px) / 5 + 6px))`, y: state === "run" ? [0, -26, 0] : 0 }}
            transition={{ left: { type: "spring", stiffness: 260, damping: 20 }, y: { duration: 0.45, repeat: state === "run" ? Infinity : 0 } }}
          >
            <Cubo size={90} mood={state === "win" ? "wow" : state === "short" || state === "far" ? "sad" : "happy"} className="mx-auto w-[88%]" />
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="toon mx-auto mt-6 w-fit max-w-full rounded-2xl bg-paper px-4 py-2 text-center font-display text-lg font-semibold"
            aria-live="polite"
          >
            {msg}
          </motion.p>
        </AnimatePresence>
        {state === "win" && (
          <div className="mt-3 flex justify-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 + i * 0.2, type: "spring" }}>
                <StarIcon size={40} />
              </motion.span>
            ))}
          </div>
        )}
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
              {prog.map((id, i) => (
                <motion.div
                  key={id}
                  initial={{ scale: 0.5, opacity: 0, x: -20 }} animate={{ scale: 1, opacity: 1, x: 0 }} exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={`flex w-fit items-center gap-2 rounded-2xl border-[3px] border-ink bg-sky px-3 py-1.5 font-display font-semibold shadow-pop ${active === i ? "running-glow" : ""}`}
                >
                  <span className="grid size-6 place-items-center rounded-md bg-paper/70"><ArrowUp size={15} strokeWidth={3} aria-hidden="true" /></span>
                  avancer
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t-[3px] border-ink p-4">
          <motion.button whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.92 }} onClick={add} className="btn flex items-center gap-2 bg-sky px-4 py-2.5 text-lg">
            <ArrowUp size={20} strokeWidth={3} aria-hidden="true" /> + avancer
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={run} className="btn flex flex-1 items-center justify-center gap-2 bg-mint px-4 py-2.5 text-lg">
            {state === "win" || state === "short" || state === "far" ? <RotateCcw size={20} strokeWidth={3} aria-hidden="true" /> : <Play size={20} strokeWidth={3} fill="#16123A" aria-hidden="true" />}
            Lancer
          </motion.button>
        </div>
        {state === "win" && (
          <Link href="/jouer/tutoriel/" className="btn mx-4 mb-4 flex items-center justify-center gap-2 bg-sun py-3 text-lg">
            Continuer l&apos;aventure <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
