"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, RotateCcw, Trophy } from "lucide-react";
import { ICON_STROKE } from "@/lib/site";

/** Boutons de fin de niveau : rejouer, puis niveau suivant, suite de l'histoire ou autres défis. */
export function WinActions({
  last,
  outro,
  onReplay,
  onNext,
  onStory,
}: {
  last: boolean;
  outro: boolean;
  onReplay: () => void;
  onNext: () => void;
  onStory: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
      <button
        onClick={onReplay}
        className="btn flex items-center justify-center gap-1.5 bg-paper py-3 text-lg sm:flex-1"
      >
        <RotateCcw size={18} strokeWidth={3} aria-hidden="true" /> Rejouer
      </button>
      {last && outro ? (
        <motion.button
          autoFocus
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          onClick={onStory}
          className="btn flex items-center justify-center gap-2 bg-sun py-3 text-lg sm:flex-2"
        >
          <BookOpen size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /> La
          suite de l'histoire
        </motion.button>
      ) : last ? (
        <Link
          href="/jouer/"
          className="btn flex items-center justify-center gap-2 bg-pink py-3 text-lg sm:flex-2"
        >
          <Trophy size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Autres défis
        </Link>
      ) : (
        <motion.button
          autoFocus
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          onClick={onNext}
          className="btn flex items-center justify-center gap-2 bg-mint py-3 text-lg sm:flex-2"
        >
          Niveau suivant{" "}
          <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
        </motion.button>
      )}
    </div>
  );
}
