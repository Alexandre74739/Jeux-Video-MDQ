"use client";
import { AnimatePresence } from "motion/react";
import type { RefObject } from "react";
import { BumpNumber } from "@/_components/animations/BumpNumber";
import { StarIcon } from "@/_components/icons/Icon";
import {
  BACKGROUNDS,
  STAGE_H,
  STAGE_W,
  type Project,
  type SpriteDef,
} from "@/lib/runtime";
import { sfx } from "@/lib/sound";
import { GameOver } from "./GameOver";
import { Planks } from "./Planks";
import { StageSprite } from "./StageSprite";
import { useStageScale } from "./useStageScale";
import type { GameState } from "./useGame";
import type { StudioState } from "./useStudio";

/** Scène du jeu : décor, personnages (déplaçables quand le jeu est arrêté), score et fin de partie. */
export function Stage({
  s,
  game,
  project,
  stageRef,
}: {
  s: StudioState;
  game: GameState;
  project: Project;
  stageRef: RefObject<HTMLDivElement | null>;
}) {
  const scale = useStageScale(stageRef);
  const { rt } = game;
  const bg = BACKGROUNDS.find((b) => b.id === project.bg) ?? BACKGROUNDS[0];

  // Pendant le jeu, toucher un personnage est un clic ; sinon on le fait glisser sur la scène.
  const grab = (e: React.PointerEvent, sp: SpriteDef) => {
    if (rt) return rt.click(sp.id);
    e.preventDefault();
    s.setSel(sp.id);
    sfx("pick");
    const box = stageRef.current!.getBoundingClientRect();
    const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
    const move = (ev: PointerEvent) =>
      s.updateSprite(sp.id, {
        x: Math.round(clamp((ev.clientX - box.left) / scale, STAGE_W)),
        y: Math.round(clamp((ev.clientY - box.top) / scale, STAGE_H)),
      });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      sfx("snap");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      aria-label="Scène du jeu. Utilise les flèches du clavier pendant le jeu."
      className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-3xl border-[3px] border-ink shadow-pop outline-none"
      style={{ background: bg.css }}
    >
      {rt && <Planks rt={rt} scale={scale} />}
      {project.sprites.map((sp) => (
        <StageSprite
          key={sp.id}
          sprite={sp}
          rt={rt}
          scale={scale}
          selected={sp.id === s.sel}
          onPointerDown={(e) => grab(e, sp)}
        />
      ))}
      {rt && (
        <div className="toon absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 font-display text-lg font-bold">
          <StarIcon size={20} /> Score :{" "}
          <BumpNumber key={rt.scoreBump} value={rt.score} />
        </div>
      )}
      <AnimatePresence>
        {game.ended && (
          <GameOver
            ended={game.ended}
            score={rt?.score ?? 0}
            onReplay={() => game.play(project)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
