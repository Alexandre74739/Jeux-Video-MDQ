"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WorldEvent } from "@/_components/game/World3D";
import {
  buildWorld,
  newId,
  runProgram,
  type Block,
  type LevelDef,
  type Outcome,
  type World,
} from "@/lib/levels";
import { sfx } from "@/lib/sound";

/** Niveau de démonstration : le coffre est à 4 cases devant Cubo. */
const DEMO: LevelDef = {
  id: 0,
  title: "Démo",
  concept: "Séquence",
  goal: "",
  tip: "",
  grid: ["TTTTTTT", "TS...FT", "TTTTTTT"],
  startDir: 1,
  blocks: ["avancer"],
  optimal: 4,
  solution: [],
};
export const MAX_BLOCKS = 7;
const STEP_MS: Partial<Record<string, number>> = {
  move: 520,
  bump: 600,
  win: 300,
};

export type DemoState = "idle" | "run" | "short" | "far";

/** Programme de la démo de l'accueil et son exécution pas à pas. */
export function useDemo() {
  const initial = useMemo(() => buildWorld(DEMO), []);
  const [prog, setProg] = useState<Block[]>([]);
  const [world, setWorld] = useState<World>(initial);
  const [event, setEvent] = useState<WorldEvent>({ kind: "reset", key: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<DemoState>("idle");
  const [won, setWon] = useState(false);
  const [fire, setFire] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const evKey = useRef(1);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setWorld(initial);
    setActiveId(null);
    setEvent({ kind: "reset", key: evKey.current++ });
  };

  const add = () => {
    if (state === "run" || prog.length >= MAX_BLOCKS) return;
    reset();
    setProg((p) => [...p, { id: newId(), type: "avancer", params: {} }]);
    setState("idle");
    sfx("snap");
  };
  const clear = () => {
    if (state === "run") return;
    reset();
    setProg([]);
    setState("idle");
    sfx("trash");
  };

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
    if (state === "run" || !prog.length) {
      sfx("bump");
      return;
    }
    reset();
    setState("run");
    sfx("click");
    const gen = runProgram(initial, prog);
    const tick = () => {
      const r = gen.next();
      if (r.done) {
        finish(r.value);
        return;
      }
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

  const replay = () => {
    setWon(false);
    reset();
    sfx("click");
  };

  return {
    prog,
    world,
    event,
    activeId,
    state,
    won,
    fire,
    add,
    clear,
    run,
    replay,
    closeWin: () => setWon(false),
  };
}
