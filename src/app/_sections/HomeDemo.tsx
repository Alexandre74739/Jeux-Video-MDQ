"use client";
import { AnimatePresence } from "motion/react";
import { Confetti } from "@/_components/animations/Confetti";
import { DemoProgram } from "./demo/DemoProgram";
import { DemoStage } from "./demo/DemoStage";
import { DemoWin } from "./demo/DemoWin";
import { useDemo } from "./demo/useDemo";

/** Mini-démo de l'accueil, dans le vrai monde du jeu (3D ou 2D) : ajoute des « avancer » et amène Cubo au coffre. */
export default function HomeDemo() {
  const d = useDemo();
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <Confetti fire={d.fire} />
      <DemoStage
        world={d.world}
        event={d.event}
        state={d.state}
        hasBlocks={d.prog.length > 0}
      />
      <DemoProgram
        prog={d.prog}
        activeId={d.activeId}
        state={d.state}
        onAdd={d.add}
        onRun={d.run}
        onClear={d.clear}
      />
      <AnimatePresence>
        {d.won && <DemoWin onClose={d.closeWin} onReplay={d.replay} />}
      </AnimatePresence>
    </div>
  );
}
