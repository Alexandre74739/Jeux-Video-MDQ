"use client";
import { motion } from "motion/react";
import { PartyPopper, RotateCcw } from "lucide-react";

/** Fin de partie sur la scène : « BRAVO ! » ou « Perdu ! », le score et Rejouer. */
export function GameOver({
  ended,
  score,
  onReplay,
}: {
  ended: "win" | "lose";
  score: number;
  onReplay: () => void;
}) {
  const win = ended === "win";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 grid place-items-center bg-ink/45"
    >
      <motion.div
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className={`rounded-3xl border-[3px] border-ink px-6 py-4 text-center shadow-pop-lg ${win ? "bg-sun" : "bg-coral"}`}
      >
        {win && (
          <PartyPopper
            size={44}
            strokeWidth={2.5}
            className="mx-auto"
            aria-hidden="true"
          />
        )}
        <p className="font-display text-4xl font-bold">
          {win ? "BRAVO !" : "Perdu !"}
        </p>
        <p className="font-bold">Score : {score}</p>
        <button
          onClick={onReplay}
          className="btn mt-2 inline-flex items-center gap-1.5 bg-paper px-4 py-1.5"
        >
          <RotateCcw size={17} strokeWidth={3} aria-hidden="true" /> Rejouer
        </button>
      </motion.div>
    </motion.div>
  );
}
