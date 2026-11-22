"use client";
import { AnimatePresence, motion } from "motion/react";
import { Volume2 } from "lucide-react";
import { Cubo } from "@/_components/ui/Cubo";
import { useVoiceOn } from "@/hooks/useVoiceOn";
import { DIFFICULTY } from "@/lib/levels";
import { speak } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import type { LevelGameState } from "./useLevelGame";

/** Cubo et sa bulle : nom du niveau, notion, difficulté et message (lisible à voix haute). */
export function CuboBubble({ g }: { g: LevelGameState }) {
  const { course, level, msg } = g;
  const voiceOn = useVoiceOn();
  return (
    <div className="flex items-start gap-2">
      <motion.div
        key={g.hop}
        initial={{ y: 0 }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 0.35 }}
        className="shrink-0"
      >
        <Cubo size={64} mood={msg.mood} />
      </motion.div>
      <div className="toon relative min-h-[76px] flex-1 rounded-3xl bg-paper px-4 py-2.5">
        <span
          className="absolute top-6 -left-[11px] size-4 rotate-45 border-b-[3px] border-l-[3px] border-ink bg-paper"
          aria-hidden="true"
        />
        <p className="mb-0.5 font-display text-sm font-bold text-grape">
          {course.title} · {level.id}. {level.title}{" "}
          <span className="ml-1 rounded-full bg-lilac px-2 py-0.5 text-xs text-ink">
            {level.concept}
          </span>{" "}
          <span
            className="rounded-full px-2 py-0.5 text-xs text-ink"
            style={{ background: course.color }}
          >
            {DIFFICULTY[course.difficulty]}
          </span>
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pr-10 text-[15px] font-bold leading-snug"
            aria-live="polite"
          >
            {msg.text}
          </motion.p>
        </AnimatePresence>
        {voiceOn && (
          <button
            onClick={() => speak(msg.say)}
            className="btn absolute top-2 right-2 grid size-9 place-items-center bg-sky"
            aria-label="Écouter la consigne"
          >
            <Volume2 size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
