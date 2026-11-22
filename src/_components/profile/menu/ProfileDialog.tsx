"use client";
import { motion } from "motion/react";
import { ArrowLeft, X } from "lucide-react";
import { sfx } from "@/lib/sound";
import { EditView } from "./EditView";
import { LinkView } from "./LinkView";
import { NewPlayerView } from "./NewPlayerView";
import { PlayersView } from "./PlayersView";
import { PlayerView } from "./PlayerView";
import type { ProfileMenuState } from "./useProfileMenu";

/** Fenêtre des joueurs : boutons Fermer / Retour et écran en cours. */
export function ProfileDialog({ m }: { m: ProfileMenuState }) {
  const { view, sel } = m;
  const back = () => {
    if (view === "new" && m.step > 0) {
      m.setStep(m.step - 1);
      m.setError(null);
      sfx("click");
    } else m.go(view === "edit" || view === "link" ? "player" : "home");
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-110 flex justify-center overflow-y-auto bg-ink/50 px-4 py-6 sm:items-center"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) m.close();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="relative h-fit w-125 max-w-full rounded-4xl border-[3px] border-ink bg-paper p-5 text-left text-ink shadow-pop-xl sm:p-6"
      >
        <button
          onClick={m.close}
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-full hover:bg-cream"
          aria-label="Fermer"
        >
          <X size={22} strokeWidth={3} aria-hidden="true" />
        </button>
        {view !== "home" && (
          <button
            onClick={back}
            className="absolute top-3 left-3 grid size-10 place-items-center rounded-full hover:bg-cream"
            aria-label="Retour"
          >
            <ArrowLeft size={22} strokeWidth={3} aria-hidden="true" />
          </button>
        )}
        {view === "home" && <PlayersView m={m} />}
        {view === "player" && sel && <PlayerView m={m} sel={sel} />}
        {view === "edit" && sel && <EditView m={m} sel={sel} />}
        {view === "link" && sel && <LinkView m={m} />}
        {view === "new" && <NewPlayerView m={m} />}
      </motion.div>
    </motion.div>
  );
}
