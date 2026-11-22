"use client";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { sfx } from "@/lib/sound";

/** Boutons « Passer » et « Suivant » (ou le bouton final) d'une scène d'histoire. */
export function StoryActions({
  last,
  cta,
  onSkip,
  onNext,
}: {
  last: boolean;
  cta: string;
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
      {!last && (
        <button
          onClick={() => {
            sfx("click");
            onSkip();
          }}
          className="btn bg-paper px-5 py-3 text-lg sm:flex-1"
        >
          Passer
        </button>
      )}
      <motion.button
        autoFocus
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        onClick={() => {
          sfx("click");
          if (last) onSkip();
          else onNext();
        }}
        className="btn flex items-center justify-center gap-2 bg-mint py-3 text-lg sm:flex-[2]"
      >
        {last ? (
          <>
            <Check size={20} strokeWidth={3} aria-hidden="true" /> {cta}
          </>
        ) : (
          <>
            Suivant <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
          </>
        )}
      </motion.button>
    </div>
  );
}
