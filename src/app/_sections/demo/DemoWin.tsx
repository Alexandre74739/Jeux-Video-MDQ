"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Cubo } from "@/_components/ui/Cubo";
import { StarIcon } from "@/_components/icons/Icon";
import { sfx } from "@/lib/sound";

/** Fenêtre de victoire de la démo : on enchaîne directement sur le niveau 1 du tutoriel. */
export function DemoWin({
  onClose,
  onReplay,
}: {
  onClose: () => void;
  onReplay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/50 px-4 pt-20 pb-6 sm:items-center sm:py-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-win-title"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.4, rotate: -6, y: 60 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="relative h-fit w-[440px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:rounded-[36px] sm:p-7"
      >
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2"
          animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <Cubo size={100} mood="wow" />
        </motion.div>
        <h2 id="demo-win-title" className="mt-8 text-3xl font-bold sm:text-4xl">
          Bravo !
        </h2>
        <div
          className="my-4 flex justify-center gap-3"
          aria-label="3 étoiles sur 3"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3 + i * 0.3,
                type: "spring",
                stiffness: 400,
                damping: 10,
              }}
              aria-hidden="true"
            >
              <StarIcon size={60} />
            </motion.span>
          ))}
        </div>
        <p className="text-lg font-bold">
          Tu viens d&apos;écrire ton tout premier programme. Prêt pour la vraie
          aventure ?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={onReplay}
            className="btn flex items-center justify-center gap-1.5 bg-paper py-3 text-lg sm:flex-1"
          >
            <RotateCcw size={18} strokeWidth={3} aria-hidden="true" /> Rejouer
          </button>
          <motion.div
            className="sm:flex-[2]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <Link
              href="/jouer/tutoriel/?niveau=1"
              autoFocus
              onClick={() => sfx("click")}
              className="btn flex w-full items-center justify-center gap-2 bg-mint py-3 text-lg"
            >
              Niveau suivant{" "}
              <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
