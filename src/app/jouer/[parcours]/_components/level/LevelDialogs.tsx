"use client";
import { AnimatePresence, motion } from "motion/react";
import StoryModal from "@/_components/game/StoryModal";
import { mapPieces } from "@/lib/levels";
import { sfx, speak } from "@/lib/sound";
import { STORY } from "@/lib/story";
import { WinCard } from "../WinCard";
import type { LevelGameState } from "./useLevelGame";

/** Fenêtres par-dessus le niveau : victoire, puis scènes de l'histoire (début et fin du parcours). */
export function LevelDialogs({ g }: { g: LevelGameState }) {
  const { win, story, level, course } = g;
  const scenes = STORY[course.slug];
  return (
    <>
      <AnimatePresence>
        {win && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-90 flex justify-center overflow-y-auto bg-ink/50 px-4 pt-20 pb-6 sm:items-center sm:py-16"
            role="dialog"
            aria-modal="true"
            aria-labelledby="win-title"
            // Un clic à côté de la carte ferme la fenêtre (le niveau reste affiché tel quel)
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                g.setWin(null);
                sfx("click");
              }
            }}
          >
            <WinCard
              info={win}
              levelId={level.id}
              optimal={level.optimal}
              last={g.last}
              onReplay={() => {
                g.setWin(null);
                g.reset();
              }}
              onNext={() => g.goLevel(g.idx + 1)}
              onStory={() => {
                g.setWin(null);
                g.setStory("outro");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {story && scenes && (
          <StoryModal
            key={story}
            scene={scenes[story]}
            map={
              scenes.piece !== undefined
                ? {
                    got: mapPieces(g.progress.stars),
                    fresh: story === "outro" ? scenes.piece : undefined,
                  }
                : undefined
            }
            cta={story === "intro" ? "C'est parti !" : "Super !"}
            onClose={() => {
              g.markSeen(story);
              g.setStory(null);
              if (story === "intro") speak(level.goal);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
