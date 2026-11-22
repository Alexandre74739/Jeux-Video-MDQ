"use client";
import { motion } from "motion/react";
import { Cubo } from "@/_components/ui/Cubo";

/** Titre de la page des défis, avec Cubo qui sautille. */
export function HubIntro() {
  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Cubo size={96} mood="wow" />
      </motion.div>
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Choisis ton défi !</h1>
        <p className="mt-1 text-lg font-semibold text-ink-soft">
          Commence par le tutoriel, puis attaque des défis de plus en plus durs.
          Chaque défi a ses nouveaux blocs.
        </p>
      </div>
    </div>
  );
}
