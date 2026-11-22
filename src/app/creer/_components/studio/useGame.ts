"use client";
import { useEffect, useRef, useState } from "react";
import { Runtime, type Project } from "@/lib/runtime";
import { sfx } from "@/lib/sound";

const GAME_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", " "];

/** Partie en cours dans la création libre : moteur du jeu, image par image, et touches du clavier. */
export function useGame(focusStage: () => void) {
  const [rt, setRt] = useState<Runtime | null>(null);
  const [, setFrame] = useState(0);
  const [ended, setEnded] = useState<"win" | "lose" | null>(null);
  const [confetti, setConfetti] = useState(0);
  const raf = useRef(0);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    setRt(null);
    setEnded(null);
  };

  const play = (project: Project) => {
    cancelAnimationFrame(raf.current);
    setEnded(null);
    const r = new Runtime(project, (res) => {
      setEnded(res);
      if (res === "win") {
        sfx("win");
        setConfetti((c) => c + 1);
      } else sfx("fail");
    });
    setRt(r);
    r.green();
    const loop = (t: number) => {
      r.tick(t);
      setFrame((f) => f + 1);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    focusStage();
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Flèches et espace envoyés au jeu (sauf pendant la saisie d'un texte).
  useEffect(() => {
    if (!rt) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (GAME_KEYS.includes(e.key)) {
        e.preventDefault();
        rt.key(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rt]);

  return { rt, running: !!rt, ended, confetti, play, stop };
}

export type GameState = ReturnType<typeof useGame>;
