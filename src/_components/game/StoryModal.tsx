"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { speak, stopSpeaking } from "@/lib/sound";
import { useEscape } from "@/hooks/useEscape";
import type { Scene } from "@/lib/story";
import { StoryActions } from "./story/StoryActions";
import { TreasureMap } from "./story/TreasureMap";

export { TreasureMap };

/** Scène d'histoire : quelques pages lues par Cubo, avec « Suivant ». */
export default function StoryModal({
  scene,
  onClose,
  map,
  cta = "C'est parti !",
}: {
  scene: Scene;
  onClose: () => void;
  map?: { got: boolean[]; fresh?: number };
  cta?: string;
}) {
  const [page, setPage] = useState(0);
  const p = scene.pages[page];
  const last = page === scene.pages.length - 1;

  useEffect(() => {
    speak(p.text);
  }, [p.text]);
  useEffect(() => () => stopSpeaking(), []);
  useEscape(onClose);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/60 px-4 pt-20 pb-6 sm:items-center sm:py-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-title"
    >
      <motion.div
        initial={{ scale: 0.6, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative h-fit w-[480px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:p-7"
      >
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <Cubo size={96} mood={p.mood} />
        </motion.div>
        <p className="mt-8 text-sm font-extrabold tracking-wide text-grape uppercase">
          L'histoire de Cubo
        </p>
        <h2 id="story-title" className="text-3xl font-bold sm:text-4xl">
          {scene.title}
        </h2>
        {map && (
          <div className="mt-3 flex justify-center">
            <TreasureMap got={map.got} fresh={map.fresh} size={180} />
          </div>
        )}
        <div className="mt-3 min-h-[96px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-lg leading-snug font-bold"
              aria-live="polite"
            >
              {p.text}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {scene.pages.map((_, i) => (
            <span
              key={i}
              className={`size-3 rounded-full border-2 border-ink ${i === page ? "bg-grape" : i < page ? "bg-ink/40" : "bg-paper"}`}
            />
          ))}
        </div>
        <StoryActions
          last={last}
          cta={cta}
          onSkip={onClose}
          onNext={() => setPage(page + 1)}
        />
      </motion.div>
    </motion.div>
  );
}
