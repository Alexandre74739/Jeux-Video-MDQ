"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { WorldEvent } from "@/_components/game/World3D";
import type { Block } from "@/lib/blocks";
import { DATA_EVENT } from "@/lib/profiles";
import {
  COURSES,
  FAIL_MESSAGES,
  buildWorld,
  countBlocks,
  runProgram,
  worldLock,
  type Outcome,
  type World,
} from "@/lib/levels";
import { load, save, saveSession } from "@/lib/storage";
import { emptyProgress, type Progress } from "@/lib/rewards";
import { LINES, tipLine } from "@/lib/lines";
import { getVoicePrefs, sfx, speak } from "@/lib/sound";
import { useMounted } from "@/hooks/useMounted";
import { useEscape } from "@/hooks/useEscape";
import type { WinInfo } from "../WinCard";
import { STEP_SFX, msgOf, randomCheer, stepDelay, type Msg } from "./gameData";
import { startState } from "./startState";
import { winResult } from "./winResult";

/** Tout l'état d'une partie : niveau, programme, exécution pas à pas, victoire et histoire. */
export function useLevelGame(slug: string) {
  const course = COURSES.find((c) => c.slug === slug) ?? COURSES[0];
  const levels = course.levels;
  const sk = (id: number) => `${course.slug}:${id}`;
  const mounted = useMounted();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [idx, setIdx] = useState(0);
  const level = levels[idx];
  const initial = buildWorld(level);
  const [program, setProgram] = useState<Block[]>([]);
  const [world, setWorld] = useState<World>(initial);
  const [event, setEvent] = useState<WorldEvent>({ kind: "reset", key: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [fast, setFast] = useState(false);
  const [msg, setMsg] = useState<Msg>(msgOf([level.goal], "happy"));
  // Série de la session : niveaux réussis depuis l'arrivée. Se tromper ne la remet jamais à zéro.
  const [streak, setStreak] = useState(0);
  const [story, setStory] = useState<"intro" | "outro" | null>(null);
  const [fails, setFails] = useState(0);
  const [win, setWin] = useState<WinInfo | null>(null);
  const [shake, setShake] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [hop, setHop] = useState(0);
  const [shown, setShown] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextEvent = (kind: WorldEvent["kind"], at?: WorldEvent["at"]) =>
    setEvent((e) => ({ kind, at, key: e.key + 1 }));

  // Chargement (une fois dans le navigateur) : progression, série, niveau à ouvrir, histoire.
  if (mounted && !ready) {
    const s = startState(course);
    setReady(true);
    setProgress(s.progress);
    setStreak(s.streak);
    setIdx(s.idx);
    if (s.intro) setStory("intro");
  }
  // Nouveau niveau affiché : son programme enregistré et un monde tout neuf.
  if (ready && shown !== sk(level.id)) {
    setShown(sk(level.id));
    setRunning(false);
    setProgram(load<Block[]>(`prog:${sk(level.id)}`, []));
    setWorld(initial);
    setActiveId(null);
    nextEvent("reset");
    setMsg(msgOf([level.goal], "happy"));
    setFails(0);
  }

  // Lecture automatique des messages de Cubo (option du menu son)
  const sayMsg = useEffectEvent(() => speak(msg.say));
  useEffect(() => {
    if (ready && !story && getVoicePrefs().auto) sayMsg();
  }, [msg.text, ready, story]);

  // Progression mise à jour par une synchronisation en ligne
  useEffect(() => {
    const reload = () => setProgress(load<Progress>("progress", emptyProgress));
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, []);

  useEscape(() => setWin(null), !!win);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const changeProgram = (p: Block[]) => {
    setProgram(p);
    save(`prog:${sk(level.id)}`, p);
  };
  const unlocked = (i: number) =>
    i === 0 || !!progress.stars[sk(levels[i - 1].id)];
  const used = countBlocks(program);
  const last = idx === levels.length - 1;

  const reset = () => {
    stop();
    setRunning(false);
    setWorld(initial);
    setActiveId(null);
    nextEvent("reset");
  };

  const onWin = () => {
    const r = winResult({
      course,
      level,
      last,
      progress,
      program,
      used,
      fails,
    });
    setProgress(r.next);
    save("progress", r.next);
    setStreak((n) => {
      saveSession("streak", n + 1);
      return n + 1;
    });
    sfx("win");
    setConfetti((c) => c + 1);
    setMsg(msgOf([randomCheer(), LINES.treasure], "wow"));
    setTimeout(() => setWin(r.info), 900);
  };

  const onFail = (reason: string) => {
    sfx("fail");
    setShake((s) => s + 1);
    const n = fails + 1;
    setFails(n);
    const base = FAIL_MESSAGES[reason];
    const hint =
      reason === "empty" || n === 1
        ? LINES.retry
        : n === 3
          ? LINES.keepGoing
          : tipLine(level.tip);
    setMsg(msgOf([base, hint], "sad"));
  };

  const finish = (out: Outcome) => {
    setRunning(false);
    setActiveId(null);
    if (out.ok) onWin();
    else onFail(out.reason);
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
      if (r.done) return finish(r.value);
      const st = r.value;
      setWorld(st.world);
      setActiveId(st.blockId);
      nextEvent(st.kind, st.at);
      const s = STEP_SFX[st.kind];
      if (s) sfx(s);
      timer.current = setTimeout(tick, stepDelay(st.kind) * (fast ? 0.5 : 1));
    };
    timer.current = setTimeout(tick, 300);
  };

  const goLevel = (i: number) => {
    if (!unlocked(i) || running) return sfx("bump");
    sfx("click");
    stop();
    setWin(null);
    setIdx(i);
  };

  const markSeen = (k: "intro" | "outro") => {
    const seen = load<string[]>("story", []);
    if (!seen.includes(`${course.slug}:${k}`))
      save("story", [...seen, `${course.slug}:${k}`]);
  };

  return {
    course,
    levels,
    level,
    idx,
    last,
    ready,
    progress,
    initial,
    program,
    world,
    event,
    activeId,
    running,
    fast,
    msg,
    streak,
    story,
    win,
    shake,
    confetti,
    hop,
    used,
    lock: ready ? worldLock(course, progress.stars) : null,
    sk,
    unlocked,
    changeProgram,
    reset,
    run,
    goLevel,
    markSeen,
    setFast,
    setStory,
    setWin,
    bounce: () => setHop((h) => h + 1),
  };
}

export type LevelGameState = ReturnType<typeof useLevelGame>;
