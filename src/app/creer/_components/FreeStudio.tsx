"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { Play, Square } from "lucide-react";
import { Confetti } from "@/_components/animations/Confetti";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { SpriteLibrary } from "./SpriteLibrary";
import { SpritePanel } from "./studio/SpritePanel";
import { SpriteProgram } from "./studio/SpriteProgram";
import { Stage } from "./studio/Stage";
import { StudioHeader } from "./studio/StudioHeader";
import { useGame } from "./studio/useGame";
import { useStudio } from "./studio/useStudio";

const icon = { size: 24, strokeWidth: ICON_STROKE, fill: "#16123A" } as const;

/** Création libre : la scène et les personnages à gauche, le programme du personnage choisi à droite. */
export default function FreeStudio() {
  const stageRef = useRef<HTMLDivElement>(null);
  const game = useGame(() => stageRef.current?.focus());
  const s = useStudio(game.stop);
  const { project } = s;

  if (!project)
    return (
      <div className="grid h-dvh place-items-center bg-cream font-display text-2xl">
        Chargement…
      </div>
    );
  const sprite = project.sprites.find((sp) => sp.id === s.sel);

  return (
    <div className="flex min-h-dvh flex-col bg-cream lg:h-dvh lg:min-h-155 lg:overflow-hidden">
      <Confetti fire={game.confetti} />
      <StudioHeader s={s} />
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-3 md:mx-auto md:max-w-140 lg:mx-0 lg:w-[min(38vw,500px)] lg:max-w-none">
          <Stage s={s} game={game} project={project} stageRef={stageRef} />
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => game.play(project)}
              className="btn flex flex-1 items-center justify-center gap-2 bg-mint py-2.5 text-2xl"
            >
              <Play {...icon} aria-hidden="true" /> Jouer
            </motion.button>
            <button
              onClick={() => {
                game.stop();
                sfx("click");
              }}
              disabled={!game.running}
              className="btn bg-coral px-6 py-2.5"
              aria-label="Arrêter"
            >
              <Square {...icon} aria-hidden="true" />
            </button>
          </div>
          <SpritePanel s={s} project={project} />
        </div>
        {sprite && (
          <SpriteProgram
            s={s}
            sprite={sprite}
            sprites={project.sprites}
            running={game.running}
          />
        )}
      </main>
      <AnimatePresence>
        {s.notice && (
          <motion.div
            key={s.notice.key}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="toon fixed bottom-5 left-1/2 z-80 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 font-display text-lg font-bold text-white"
            role="status"
          >
            {s.notice.text}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {s.libOpen && (
          <SpriteLibrary
            onClose={() => s.setLibOpen(false)}
            onPick={s.addSprite}
            onError={s.notify}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
